// Complete AI Agent System - Master Agent + Worker Agents
// Enhanced with New Customer Support and Interactive Features

// State management
let conversationState = {
  currentStep: 'phone', // phone -> sales -> verification -> underwriting -> sanction
  customerData: null,
  loanDetails: {
    amount: null,
    tenure: null,
    interestRate: 12.5
  },
  verificationComplete: false,
  underwritingResult: null
};

// DOM elements
const chatWindow = document.getElementById('chatWindow');
const inputBox = document.getElementById('inputBox');
const sendBtn = document.getElementById('sendBtn');

// Wait for all services to be ready
function waitForServices(maxAttempts = 10, delay = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkServices = () => {
      attempts++;
      const allReady = 
        window.apiServers &&
        window.apiServers.crm &&
        window.apiServers.creditBureau &&
        window.apiServers.offerMart &&
        window.blockchainService &&
        window.blockIDService &&
        window.ipfsService &&
        window.trustScoreService &&
        window.tokenService &&
        window.agentOrchestrator;
      
      if (allReady) {
        console.log('✅ All services ready!');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Some services not ready after', maxAttempts, 'attempts');
        resolve(false);
      } else {
        setTimeout(checkServices, delay);
      }
    };
    checkServices();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing AURA Chat Assistant...');
  
  // Wait for services to be ready (with longer timeout)
  const servicesReady = await waitForServices(20, 150);
  
  if (!servicesReady) {
    console.error('❌ Some services failed to initialize');
    // Still allow user to try, but show warning
    if (chatWindow) {
      const warningDiv = document.createElement('div');
      warningDiv.className = 'alert alert-warning';
      warningDiv.innerHTML = '<strong>⚠️ Warning:</strong> Some services may not be fully loaded. If you encounter errors, please refresh the page.';
      chatWindow.appendChild(warningDiv);
    }
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', handleUserMessage);
  }
  if (inputBox) {
    inputBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserMessage();
    });
  }
  
  // Show welcome message with quick actions
  addBotMessage("Hello! I am AURA, your personal loan assistant. 👋");
  setTimeout(() => {
    addBotMessage("Welcome to Tata Capital! I'm here to help you with your personal loan application.");
    addBotMessage("Please enter your registered phone number to get started:");
    addBotMessage("(You can also use your AURA token to resume: AURA-XXXXX)");
  }, 1000);
  
  // Update progress indicator
  updateProgressIndicator();
  
  // Initialize services check
  checkServicesInitialized();
  
  console.log('✅ AURA Chat Assistant initialized');
});

// Check if all services are initialized
function checkServicesInitialized() {
  const services = {
    'API Servers': window.apiServers,
    'Blockchain': window.blockchainService,
    'BlockID': window.blockIDService,
    'IPFS': window.ipfsService,
    'Trust Score': window.trustScoreService,
    'Token Service': window.tokenService,
    'Agent Orchestrator': window.agentOrchestrator
  };
  
  const missing = Object.entries(services).filter(([name, service]) => !service);
  
  if (missing.length > 0) {
    console.warn('Missing services:', missing.map(([name]) => name).join(', '));
  } else {
    console.log('✅ All services initialized successfully');
  }
}

// Add message to chat with enhanced styling
function addMessage(text, isUser = false, options = {}) {
  const messageDiv = document.createElement('div');
  messageDiv.className = isUser ? 'user' : 'bot';
  
  if (options.html) {
    messageDiv.innerHTML = text;
  } else {
    messageDiv.textContent = text;
  }
  
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  // Animation
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(10px)';
  setTimeout(() => {
    messageDiv.style.transition = 'all 0.3s ease';
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 10);
}

function addBotMessage(text, options = {}) {
  addMessage(`AURA 🤖: ${text}`, false, options);
}

function addUserMessage(text) {
  addMessage(text, true);
}

// Add quick reply buttons
function addQuickReplies(replies) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'quick-replies mb-3';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexWrap = 'wrap';
  buttonContainer.style.gap = '8px';
  
  replies.forEach(reply => {
    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary btn-sm quick-reply-btn';
    button.textContent = reply;
    button.onclick = () => {
      // Remove all quick reply buttons
      document.querySelectorAll('.quick-replies').forEach(el => el.remove());
      // Send the reply as user message
      inputBox.value = reply;
      handleUserMessage();
    };
    buttonContainer.appendChild(button);
  });
  
  chatWindow.appendChild(buttonContainer);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Update progress indicator
function updateProgressIndicator() {
  const progressSteps = [
    { step: 'phone', label: 'Phone Verification', icon: '📞' },
    { step: 'sales', label: 'Loan Details', icon: '💰' },
    { step: 'verification', label: 'KYC Verification', icon: '✅' },
    { step: 'underwriting', label: 'Underwriting', icon: '📊' },
    { step: 'sanction', label: 'Sanction Letter', icon: '📄' }
  ];
  
  const currentIndex = progressSteps.findIndex(s => s.step === conversationState.currentStep);
  
  const progressHTML = progressSteps.map((step, index) => {
    let status = '';
    if (index < currentIndex) status = 'completed';
    else if (index === currentIndex) status = 'active';
    else status = 'pending';
    
    return `
      <div class="progress-step ${status}" data-step="${step.step}">
        <div class="progress-icon">${step.icon}</div>
        <div class="progress-label">${step.label}</div>
      </div>
    `;
  }).join('');
  
  let progressContainer = document.getElementById('progressIndicator');
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'progressIndicator';
    progressContainer.className = 'progress-indicator mb-3';
    chatWindow.parentElement.insertBefore(progressContainer, chatWindow);
  }
  progressContainer.innerHTML = progressHTML;
}

// Update worker agent status
function updateAgentStatus(agent, status, message = '') {
  const statusMap = {
    'sales': 'salesStatus',
    'verify': 'verifyStatus',
    'under': 'underStatus',
    'letter': 'letterStatus'
  };
  
  const element = document.getElementById(statusMap[agent]);
  if (element) {
    const statusColors = {
      'Waiting': 'bg-secondary',
      'Active': 'bg-primary',
      'Processing': 'bg-warning',
      'Complete': 'bg-success',
      'Pending': 'bg-secondary',
      'Error': 'bg-danger'
    };
    
    element.textContent = status + (message ? ` - ${message}` : '');
    element.className = `badge ${statusColors[status] || 'bg-secondary'}`;
    
    // Pulse animation
    element.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }
}

// Master Agent - Main orchestration
async function handleUserMessage() {
  const userInput = inputBox.value.trim();
  if (!userInput) return;
  
  addUserMessage(userInput);
  inputBox.value = '';
  inputBox.disabled = true;
  sendBtn.disabled = true;
  
  // Show typing indicator
  showTypingIndicator();
  
  await new Promise(resolve => setTimeout(resolve, 800));
  hideTypingIndicator();
  
  try {
    switch (conversationState.currentStep) {
      case 'phone':
        await handlePhoneInput(userInput);
        break;
      case 'sales':
        await handleSalesConversation(userInput);
        break;
      case 'verification':
        await handleVerification(userInput);
        break;
      case 'underwriting':
        await handleUnderwriting(userInput);
        break;
      default:
        addBotMessage("Thank you for using AURA. Your loan process is complete!");
    }
  } catch (error) {
    addBotMessage("I apologize, but I encountered an error. Please try again.");
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
  } finally {
    inputBox.disabled = false;
    sendBtn.disabled = false;
    inputBox.focus();
  }
}

// Step 1: Phone number verification - Existing Customers Only
async function handlePhoneInput(phone) {
  try {
    // Check if it's a token
    if (phone.toUpperCase().startsWith('AURA-')) {
      await handleTokenInput(phone.toUpperCase());
      return;
    }
    
    // Check if user wants to use token
    if (phone.toLowerCase().includes('token') || phone.toLowerCase().includes('i have')) {
      addBotMessage("Please enter your AURA token (format: AURA-XXXXX):");
      conversationState.waitingForToken = true;
      return;
    }
    
    // If waiting for token
    if (conversationState.waitingForToken) {
      if (phone.toUpperCase().startsWith('AURA-')) {
        await handleTokenInput(phone.toUpperCase());
      } else {
        addBotMessage("Invalid token format. Please enter a token starting with 'AURA-'");
      }
      conversationState.waitingForToken = false;
      return;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      addBotMessage("Please enter a valid 10-digit phone number starting with 6-9, or use your AURA token to resume.");
      addQuickReplies(['Try Again']);
      return;
    }
    
    addBotMessage("Thank you! Let me verify your details...");
    
    // Generate token for this session
    if (window.tokenService) {
      const tokenResponse = await window.tokenService.generateToken(phone);
      conversationState.tokenId = tokenResponse.data.tokenId;
      addBotMessage(`🔑 Your application token: ${tokenResponse.data.tokenId}`);
      addBotMessage("You can use this token to resume your application anytime!");
    }
    
    // Show agent activity
    if (window.agentOrchestrator) {
      window.agentOrchestrator.showAgentActivity('Master Agent', 'Checking KYC with BlockID Service...');
      window.agentOrchestrator.updateAgentStatus('Master Agent', 'processing');
    }
    
    // Step 1: Check BlockID for KYC existence (as per wireframe)
    updateAgentStatus('verify', 'Processing', 'Checking BlockID');
    
    if (!window.blockIDService) {
      throw new Error('BlockID Service not initialized');
    }
    
    const blockIDResponse = await window.blockIDService.checkKYCExists(phone);
    
    // Update BlockID Panel
    updateBlockIDPanel(blockIDResponse.data);
    
    if (!blockIDResponse || !blockIDResponse.data || !blockIDResponse.data.kycExists) {
      addBotMessage("I couldn't find your KYC details in BlockID. Would you like to register as a new customer?");
      addQuickReplies(['Yes, Register Me', 'No, Try Different Number']);
      conversationState.registrationData.phone = phone;
      
      if (window.agentOrchestrator) {
        window.agentOrchestrator.showAgentActivity('BlockID Service', 'KYC not found');
      }
      return;
    }
    
    addBotMessage("✅ KYC verified through BlockID! Proceeding with loan application...");
    
    // Handoff to Verification Agent
    if (window.agentOrchestrator) {
      await window.agentOrchestrator.handoffToAgent('Master Agent', 'Verification Agent', { 
        phone, 
        action: 'verify_customer',
        blockId: blockIDResponse.data.blockId 
      });
    }
    
    updateAgentStatus('verify', 'Processing', 'Checking CRM');
    
    // Call CRM Server API
    if (!window.apiServers) {
      throw new Error('API Servers not initialized. Please refresh the page.');
    }
    
    if (!window.apiServers.crm) {
      throw new Error('CRM Server not initialized. Please refresh the page.');
    }
    
    const crmResponse = await window.apiServers.crm.getCustomer(phone);
    
    if (!crmResponse || !crmResponse.success || !crmResponse.data) {
      updateAgentStatus('verify', 'Error', 'Customer not found');
      addBotMessage("I couldn't find your details in our CRM system. Please contact our customer service at 1800-XXX-XXXX or visit your nearest branch.");
      addBotMessage("Note: This system is for existing Tata Capital customers only.");
      
      if (window.agentOrchestrator) {
        window.agentOrchestrator.showAgentActivity('Verification Agent', 'Customer not found in CRM');
        window.agentOrchestrator.updateAgentStatus('Verification Agent', 'error');
      }
      return;
    }
    
    // Map CRM response to customer data
    const crmData = crmResponse.data;
    let customer = null;
    
    // Find customer from window.dummyCustomers (set by data.js)
    if (typeof window !== 'undefined' && window.dummyCustomers) {
      customer = window.dummyCustomers.find(c => c.phone === phone);
    }
    
    // If still not found, create from CRM data
    if (!customer && crmData) {
      customer = {
        phone: crmData.phone,
        name: crmData.name,
        age: crmData.age,
        city: crmData.city,
        address: crmData.address,
        creditScore: 750, // Default
        preApprovedLimit: 500000, // Default
        salary: 100000, // Default
        currentLoan: { amount: 0, emi: 0, tenure: 0 }
      };
    }
    
    if (!customer) {
      throw new Error('Unable to retrieve customer data');
    }
    
    conversationState.customerData = customer;
    updateAgentStatus('verify', 'Complete', 'Verified');
    
    if (window.agentOrchestrator) {
      window.agentOrchestrator.showAgentActivity('Verification Agent', `Customer verified: ${crmData.name}`);
      window.agentOrchestrator.updateAgentStatus('Verification Agent', 'complete');
    }
    
    addBotMessage(`Hello ${customer.name}! 👋 I found your account. You're from ${customer.city}.`);
    
    // Transition to Sales Agent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handoff to Sales Agent
    if (window.agentOrchestrator) {
      await window.agentOrchestrator.handoffToAgent('Verification Agent', 'Sales Agent', { 
        customerId: crmData.customerId,
        name: customer.name,
        phone: customer.phone 
      });
    }
    
    conversationState.currentStep = 'sales';
    updateProgressIndicator();
    updateAgentStatus('sales', 'Active', 'Engaging customer');
    await activateSalesAgent();
  } catch (error) {
    console.error('Error in handlePhoneInput:', error);
    addBotMessage(`I encountered an error: ${error.message}. Please try again.`);
    if (window.agentOrchestrator) {
      window.agentOrchestrator.showAgentActivity('Master Agent', `Error: ${error.message}`);
    }
  }
}

// Handle token input to resume session
async function handleTokenInput(tokenId) {
  try {
    addBotMessage("Verifying your token...");
    
    if (!window.tokenService) {
      throw new Error('Token Service not available');
    }
    
    const tokenResponse = await window.tokenService.useToken(tokenId);
    
    if (!tokenResponse.success) {
      addBotMessage(`Token verification failed: ${tokenResponse.error}`);
      addQuickReplies(['Enter Phone Number', 'Try Different Token']);
      return;
    }
    
    const token = tokenResponse.data.token;
    conversationState.tokenId = token.tokenId;
    conversationState.customerData = token.customerData;
    
    addBotMessage(`✅ Token verified! Welcome back!`);
    addBotMessage(`Resuming your loan application...`);
    
    // Resume from where they left off
    conversationState.currentStep = 'sales';
    updateProgressIndicator();
    updateAgentStatus('sales', 'Active', 'Resumed session');
    await activateSalesAgent();
  } catch (error) {
    console.error('Error in handleTokenInput:', error);
    addBotMessage(`Error verifying token: ${error.message}`);
  }
}

// Step 2: Sales Agent - Loan negotiation
// Connects to Offer Mart Server to fetch pre-approved offers
async function activateSalesAgent() {
  const customer = conversationState.customerData;
  
  if (!customer) {
    addBotMessage("Customer data not found. Please start over.");
    return;
  }
  
  // Show agent activity
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Sales Agent', `Connecting to ${window.apiServers.offerMart.serverName}...`);
    window.agentOrchestrator.showAgentActivity('Sales Agent', 'Requesting pre-approved offers from Offer Mart Server...');
  }
  
  updateAgentStatus('sales', 'Processing', 'Fetching offers');
  
  // Fetch from Offer Mart API (as per wireframe)
  if (!window.apiServers) {
    addBotMessage("API Servers are not initialized. Please refresh the page.");
    updateAgentStatus('sales', 'Error', 'Servers not ready');
    return;
  }
  
  if (!window.apiServers.offerMart) {
    addBotMessage("Offer Mart Server is not available. Please refresh the page.");
    updateAgentStatus('sales', 'Error', 'Server not ready');
    return;
  }
  
  const offerResponse = await window.apiServers.offerMart.getPreApprovedLimit(customer.phone);
  
  if (!offerResponse.success) {
    addBotMessage("I'm having trouble fetching your offers from Offer Mart Server. Please try again later.");
    updateAgentStatus('sales', 'Error', 'Offer fetch failed');
    return;
  }
  
  const offerData = offerResponse.data;
  const preApprovedLimit = offerData.preApprovedLimit;
  const interestRate = offerData.interestRate;
  
  // Update loan details with interest rate from Offer Mart
  conversationState.loanDetails.interestRate = interestRate;
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Sales Agent', `Received offer: ₹${preApprovedLimit.toLocaleString('en-IN')} at ${interestRate}%`);
  }
  
  updateAgentStatus('sales', 'Active', 'Engaging customer');
  
  addBotMessage(`Great news! You have a pre-approved personal loan limit of ₹${preApprovedLimit.toLocaleString('en-IN')} at ${interestRate}% interest rate.`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  addBotMessage("How much loan amount are you looking for?");
  
  // Add quick amount suggestions
  const suggestions = [
    `₹${Math.floor(preApprovedLimit * 0.5).toLocaleString('en-IN')}`,
    `₹${preApprovedLimit.toLocaleString('en-IN')}`,
    `₹${Math.floor(preApprovedLimit * 1.5).toLocaleString('en-IN')}`
  ];
  addQuickReplies(suggestions);
}

async function handleSalesConversation(input) {
  const customer = conversationState.customerData;
  const preApprovedLimit = customer.preApprovedLimit;
  
  // Check if we're waiting for tenure
  if (conversationState.loanDetails.amount && !conversationState.loanDetails.tenure) {
    await handleTenureInput(input);
    return;
  }
  
  // Check if waiting for salary slip confirmation
  if (conversationState.needsSalarySlip && !conversationState.salarySlipConfirmed) {
    if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('ok') || input.toLowerCase().includes('proceed')) {
      conversationState.salarySlipConfirmed = true;
      addBotMessage("Great! We'll need your salary slip during the process.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      addBotMessage("What loan tenure would you prefer?");
      addQuickReplies(['12 months', '24 months', '36 months', '48 months', '60 months']);
      return;
    } else {
      addBotMessage("Please type 'yes' to proceed with the higher loan amount, or enter a different amount.");
      return;
    }
  }
  
  // Extract loan amount
  const amountMatch = input.match(/₹?(\d+[\d,]*)/);
  let requestedAmount = null;
  
  if (amountMatch) {
    requestedAmount = parseInt(amountMatch[1].replace(/,/g, ''));
  } else {
    const numbers = input.match(/\d+/g);
    if (numbers) {
      requestedAmount = parseInt(numbers[0]);
      if (requestedAmount < 10000) {
        requestedAmount = requestedAmount * 100000;
      }
    }
  }
  
  if (!requestedAmount || requestedAmount < 50000) {
    addBotMessage("Please enter a valid loan amount (minimum ₹50,000). For example: ₹5,00,000 or 5 lakhs");
    return;
  }
  
  conversationState.loanDetails.amount = requestedAmount;
  
  if (requestedAmount > preApprovedLimit * 2) {
    addBotMessage(`I see you're requesting ₹${requestedAmount.toLocaleString('en-IN')}. However, your pre-approved limit is ₹${preApprovedLimit.toLocaleString('en-IN')}.`);
    addBotMessage(`Would you like to proceed with ₹${preApprovedLimit.toLocaleString('en-IN')} instead?`);
    addQuickReplies([`Yes, ₹${preApprovedLimit.toLocaleString('en-IN')}`, 'No, Try Higher Amount']);
    return;
  }
  
  if (requestedAmount > preApprovedLimit) {
    addBotMessage(`You're requesting ₹${requestedAmount.toLocaleString('en-IN')}, which is above your pre-approved limit of ₹${preApprovedLimit.toLocaleString('en-IN')}.`);
    addBotMessage("We can process this, but you'll need to provide a salary slip for verification. Proceed?");
    conversationState.needsSalarySlip = true;
    conversationState.salarySlipConfirmed = false;
    addQuickReplies(['Yes, Proceed', 'No, Lower Amount']);
    return;
  }
  
  addBotMessage(`Perfect! ₹${requestedAmount.toLocaleString('en-IN')} is within your pre-approved limit.`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  addBotMessage("What loan tenure would you prefer?");
  addQuickReplies(['12 months', '24 months', '36 months', '48 months', '60 months']);
}

// Handle tenure input
async function handleTenureInput(input) {
  const tenureMatch = input.match(/(\d+)\s*(month|year|yr|m)/i) || input.match(/(\d+)/);
  let tenure = null;
  
  if (tenureMatch) {
    tenure = parseInt(tenureMatch[1]);
    if (input.toLowerCase().includes('year') || input.toLowerCase().includes('yr')) {
      tenure = tenure * 12;
    }
  }
  
  if (!tenure || (tenure !== 12 && tenure !== 24 && tenure !== 36 && tenure !== 48 && tenure !== 60)) {
    addBotMessage("Please choose a tenure: 12, 24, 36, 48, or 60 months");
    addQuickReplies(['12 months', '24 months', '36 months', '48 months', '60 months']);
    return;
  }
  
  conversationState.loanDetails.tenure = tenure;
  
  // Calculate EMI
  const principal = conversationState.loanDetails.amount;
  const rate = conversationState.loanDetails.interestRate / 12 / 100;
  const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
  
  // Show loan summary card
  addBotMessage(`Excellent! Here's your loan summary:`, { html: true });
  
  const summaryCard = document.createElement('div');
  summaryCard.className = 'loan-summary-card p-3 mb-2';
  summaryCard.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <strong>💰 Amount:</strong>
      <span>₹${principal.toLocaleString('en-IN')}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <strong>📅 Tenure:</strong>
      <span>${tenure} months</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <strong>💵 EMI:</strong>
      <span class="text-success fw-bold">₹${Math.round(emi).toLocaleString('en-IN')}/month</span>
    </div>
    <div class="d-flex justify-content-between">
      <strong>📊 Interest Rate:</strong>
      <span>${conversationState.loanDetails.interestRate}% p.a.</span>
    </div>
  `;
  chatWindow.appendChild(summaryCard);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  // Update loan summary card in sidebar
  updateLoanSummary(principal, tenure, Math.round(emi));
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  updateAgentStatus('sales', 'Complete', 'Terms finalized');
  
  // Move to verification
  conversationState.currentStep = 'verification';
  updateProgressIndicator();
  await activateVerificationAgent();
}

// Update loan summary card
function updateLoanSummary(amount, tenure, emi) {
  const card = document.getElementById('loanSummaryCard');
  if (card) {
    document.getElementById('summaryAmount').textContent = `₹${amount.toLocaleString('en-IN')}`;
    document.getElementById('summaryTenure').textContent = `${tenure} months`;
    document.getElementById('summaryEMI').textContent = `₹${emi.toLocaleString('en-IN')}`;
    card.style.display = 'block';
    card.style.animation = 'slideIn 0.5s ease';
  }
}

// Step 3: Verification Agent
// Connects to CRM Server to verify KYC details
async function activateVerificationAgent() {
  updateAgentStatus('verify', 'Active', 'Verifying KYC');
  addBotMessage("Now let me verify your KYC details...");
  
  const customer = conversationState.customerData;
  if (!customer) {
    addBotMessage("Customer data not found. Please start over.");
    return;
  }
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Verification Agent', `Connecting to ${window.apiServers.crm.serverName}...`);
    window.agentOrchestrator.showAgentActivity('Verification Agent', 'Fetching KYC data from CRM Server...');
  }
  
  updateAgentStatus('verify', 'Processing', 'Checking CRM');
  
  // Fetch KYC data from CRM Server (as per wireframe)
  if (!window.apiServers) {
    addBotMessage("API Servers are not initialized. Please refresh the page.");
    updateAgentStatus('verify', 'Error', 'Servers not ready');
    return;
  }
  
  if (!window.apiServers.crm) {
    addBotMessage("CRM Server is not available. Please refresh the page.");
    updateAgentStatus('verify', 'Error', 'Server not ready');
    return;
  }
  
  const crmResponse = await window.apiServers.crm.getCustomer(customer.phone);
  
  if (!crmResponse.success) {
    addBotMessage("Unable to verify KYC from CRM Server. Please try again.");
    updateAgentStatus('verify', 'Error', 'CRM fetch failed');
    return;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Verification Agent', 'KYC data retrieved from CRM Server');
    window.agentOrchestrator.showAgentActivity('Verification Agent', 'KYC verification completed');
  }
  
  // Show complete KYC verification from CRM
  const kycCard = document.createElement('div');
  kycCard.className = 'kyc-card p-3 mb-2';
  kycCard.innerHTML = `
    <div class="mb-2"><strong>KYC Verification Complete ✅</strong></div>
    <div class="mb-2">✅ <strong>Phone:</strong> ${customer.phone}</div>
    <div class="mb-2">✅ <strong>Name:</strong> ${customer.name}</div>
    <div class="mb-2">✅ <strong>Address:</strong> ${customer.address}</div>
    <div class="mb-2">✅ <strong>Age:</strong> ${customer.age} years</div>
    <div class="mb-2">✅ <strong>PAN:</strong> ${customer.pan || 'Verified'}</div>
    <div class="mb-0">✅ <strong>KYC Status:</strong> ${crmResponse.data.kycStatus}</div>
  `;
  chatWindow.appendChild(kycCard);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  conversationState.verificationComplete = true;
  updateAgentStatus('verify', 'Complete', 'KYC verified');
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Handoff to Underwriting Agent
  if (window.agentOrchestrator) {
    await window.agentOrchestrator.handoffToAgent('Verification Agent', 'Underwriting Agent', { 
      customerId: crmResponse.data.customerId,
      kycStatus: 'VERIFIED',
      loanAmount: conversationState.loanDetails.amount
    });
  }
  
  // Move to underwriting
  conversationState.currentStep = 'underwriting';
  updateProgressIndicator();
  await activateUnderwritingAgent();
}

// Step 4: Underwriting Agent
// Connects to Credit Bureau API and Trust Score Service
async function activateUnderwritingAgent() {
  updateAgentStatus('under', 'Active', 'Evaluating eligibility');
  addBotMessage("Processing your loan application through our underwriting system...");
  
  const customer = conversationState.customerData;
  if (!customer) {
    addBotMessage("Customer data not found. Please start over.");
    return;
  }
  
  const loanAmount = conversationState.loanDetails.amount;
  const preApprovedLimit = customer.preApprovedLimit;
  const creditScore = customer.creditScore;
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', 'Starting eligibility evaluation...');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate Trust Score (as per wireframe)
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', 'Generating Trust Score from financial data...');
  }
  
  if (!window.trustScoreService) {
    addBotMessage("Trust Score Service is not available.");
    return;
  }
  
  const trustScoreResponse = await window.trustScoreService.generateTrustScore(customer);
  
  updateAgentStatus('under', 'Processing', 'Checking credit score');
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', `Connecting to ${window.apiServers.creditBureau.serverName}...`);
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', 'Fetching credit score from Credit Bureau API...');
  }
  
  // Fetch credit score from Credit Bureau API (as per wireframe)
  if (!window.apiServers) {
    addBotMessage("API Servers are not initialized. Please refresh the page.");
    updateAgentStatus('under', 'Error', 'Servers not ready');
    return;
  }
  
  if (!window.apiServers.creditBureau) {
    addBotMessage("Credit Bureau API is not available. Please refresh the page.");
    updateAgentStatus('under', 'Error', 'Server not ready');
    return;
  }
  
  const creditResponse = await window.apiServers.creditBureau.getCreditScore(customer.phone);
  
  if (!creditResponse.success) {
    addBotMessage("Unable to fetch credit score from Credit Bureau. Using existing data.");
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const fetchedCreditScore = creditResponse.success ? creditResponse.data.creditScore : creditScore;
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', `Credit score received from Credit Bureau: ${fetchedCreditScore}/900`);
    window.agentOrchestrator.showAgentActivity('Underwriting Agent', `Trust Score: ${trustScoreResponse.data.trustScore}/100 (${trustScoreResponse.data.trustLevel})`);
  }
  
  addBotMessage(`Your credit score from Credit Bureau: ${fetchedCreditScore}/900 ${fetchedCreditScore >= 750 ? '🌟' : fetchedCreditScore >= 700 ? '👍' : '⚠️'}`);
  addBotMessage(`Trust Score: ${trustScoreResponse.data.trustScore}/100 (${trustScoreResponse.data.trustLevel})`);
  
  // Underwriting rules - Use fetchedCreditScore (from Credit Bureau API)
  let result = null;
  
  if (fetchedCreditScore < 700) {
    result = {
      status: 'rejected',
      reason: 'Credit score below 700'
    };
  } else if (loanAmount > preApprovedLimit * 2) {
    result = {
      status: 'rejected',
      reason: 'Loan amount exceeds 2x pre-approved limit'
    };
  } else if (loanAmount <= preApprovedLimit) {
    result = {
      status: 'approved',
      type: 'instant'
    };
  } else if (loanAmount <= preApprovedLimit * 2) {
    // Need salary slip verification
    if (conversationState.needsSalarySlip && conversationState.salarySlipUploaded) {
      // Calculate EMI
      const principal = loanAmount;
      const rate = conversationState.loanDetails.interestRate / 12 / 100;
      const tenure = conversationState.loanDetails.tenure || 36;
      const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
      
      if (emi <= customer.salary * 0.5) {
        result = {
          status: 'approved',
          type: 'conditional'
        };
      } else {
        result = {
          status: 'rejected',
          reason: 'EMI exceeds 50% of salary'
        };
      }
    } else {
      result = {
        status: 'pending',
        needsSalarySlip: true
      };
    }
  }
  
  conversationState.underwritingResult = result;
  
  await processUnderwritingResult(result);
}

async function processUnderwritingResult(result) {
  if (result.status === 'approved') {
    updateAgentStatus('under', 'Complete', 'Approved');
    
    if (result.type === 'instant') {
      addBotMessage("🎉 Great news! Your loan is INSTANTLY APPROVED!");
    } else {
      addBotMessage("🎉 Your loan is CONDITIONALLY APPROVED after salary verification!");
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Handoff to Sanction Letter Agent
    if (window.agentOrchestrator) {
      await window.agentOrchestrator.handoffToAgent('Underwriting Agent', 'Sanction Letter Agent', { 
        status: 'APPROVED',
        loanAmount: conversationState.loanDetails.amount,
        tenure: conversationState.loanDetails.tenure,
        customerId: conversationState.customerData.phone
      });
    }
    
    // Move to sanction letter
    conversationState.currentStep = 'sanction';
    updateProgressIndicator();
    await generateSanctionLetter();
    
  } else if (result.status === 'pending') {
    addBotMessage("To proceed with this loan amount, please upload your salary slip.");
    
    // Add file upload button with better styling
    const uploadDiv = document.createElement('div');
    uploadDiv.className = 'mt-3 p-3 border rounded bg-light upload-container';
    uploadDiv.style.maxWidth = '400px';
    uploadDiv.innerHTML = `
      <div class="mb-2">
        <label for="salarySlipUpload" class="form-label"><i class="fas fa-file-upload me-2"></i>Select Salary Slip (PDF/Image)</label>
        <input type="file" id="salarySlipUpload" accept=".pdf,.jpg,.jpeg,.png" class="form-control">
      </div>
      <button class="btn btn-primary w-100" onclick="handleSalarySlipUpload()">
        <i class="fas fa-upload me-2"></i>Upload Salary Slip
      </button>
    `;
    chatWindow.appendChild(uploadDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
  } else {
    updateAgentStatus('under', 'Error', 'Rejected');
    addBotMessage(`❌ I'm sorry, but your loan application has been rejected.`);
    addBotMessage(`Reason: ${result.reason}`);
    addBotMessage("Please contact our customer service for more details or try again with different parameters.");
    addQuickReplies(['Try Different Amount', 'Contact Support']);
  }
}

// Handle salary slip upload
window.handleSalarySlipUpload = function() {
  const fileInput = document.getElementById('salarySlipUpload');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileName = file.name;
    conversationState.salarySlipUploaded = true;
    addUserMessage(`Salary slip uploaded: ${fileName}`);
    
    // Remove upload UI
    const uploadDiv = fileInput.closest('.upload-container');
    if (uploadDiv) {
      uploadDiv.style.transition = 'opacity 0.3s';
      uploadDiv.style.opacity = '0';
      setTimeout(() => uploadDiv.remove(), 300);
    }
    
    updateAgentStatus('under', 'Processing', 'Uploading to IPFS');
    addBotMessage("✅ Salary slip received! Uploading to IPFS for decentralized storage...");
    
    // Upload to IPFS (as per wireframe)
    if (window.ipfsService) {
      window.ipfsService.uploadFile(file, {
        type: 'salary_slip',
        customerPhone: conversationState.customerData.phone,
        uploadedBy: 'Underwriting Agent'
      }).then(ipfsResponse => {
        addBotMessage(`✅ File uploaded to IPFS! CID: ${ipfsResponse.data.cid}`);
        addBotMessage("✅ Salary slip verified successfully!");
        
        // Store IPFS hash for smart contract
        conversationState.ipfsHash = ipfsResponse.data.cid;
        
        setTimeout(() => {
          conversationState.currentStep = 'underwriting';
          // Re-run underwriting with salary slip
          activateUnderwritingAgent();
        }, 1000);
      });
    } else {
      setTimeout(() => {
        addBotMessage("✅ Salary slip verified successfully!");
        conversationState.currentStep = 'underwriting';
        activateUnderwritingAgent();
      }, 2000);
    }
  } else {
    addBotMessage("Please select a file to upload.");
  }
};

// Step 5: Sanction Letter Generator with Smart Contract
async function generateSanctionLetter() {
  updateAgentStatus('letter', 'Active', 'Generating Smart Contract');
  addBotMessage("Generating your sanction letter and Smart Contract...");
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Sanction Letter Agent', 'Creating Smart Contract on Blockchain...');
  }
  
  // Create Smart Contract (as per wireframe)
  const loanData = {
    customer: conversationState.customerData,
    loan: conversationState.loanDetails,
    result: conversationState.underwritingResult,
    ipfsHash: conversationState.ipfsHash || null
  };
  
  if (window.blockchainService) {
    const smartContract = window.blockchainService.createSanctionContract(loanData);
    loanData.smartContract = smartContract;
    
    addBotMessage(`✅ Smart Contract created! Contract ID: ${smartContract.contractId}`);
    addBotMessage(`📄 Contract Hash: ${smartContract.contractHash.substring(0, 20)}...`);
    
    if (window.agentOrchestrator) {
      window.agentOrchestrator.showAgentActivity('Sanction Letter Agent', `Smart Contract deployed: ${smartContract.contractId}`);
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Sanction Letter Agent', 'Generating PDF document...');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (window.agentOrchestrator) {
    window.agentOrchestrator.showAgentActivity('Sanction Letter Agent', 'PDF generated successfully');
    window.agentOrchestrator.updateAgentStatus('Sanction Letter Agent', 'complete');
  }
  
  updateAgentStatus('letter', 'Complete', 'Ready');
  addBotMessage("✅ Your sanction letter is ready!");
  addBotMessage("✅ Smart Contract has been recorded on the blockchain!");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Store loan data with smart contract
  sessionStorage.setItem('loanData', JSON.stringify(loanData));
  window.location.href = 'result.html';
}

// Typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.className = 'bot typing';
  typingDiv.innerHTML = 'AURA 🤖: <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTypingIndicator() {
  const typingDiv = document.getElementById('typingIndicator');
  if (typingDiv) {
    typingDiv.remove();
  }
}

// Update BlockID Panel
function updateBlockIDPanel(blockIDData) {
  const blockIDPanel = document.getElementById('blockIDPanel');
  if (!blockIDPanel) return;

  const panelContent = document.createElement('div');
  panelContent.className = 'blockid-status';
  
  if (blockIDData.kycExists || blockIDData.blockId) {
    panelContent.innerHTML = `
      <div class="blockid-verified">
        <i class="fas fa-check-circle text-success me-2"></i>
        <strong>KYC Verified</strong>
      </div>
      <div class="blockid-details mt-2">
        <small><strong>Block ID:</strong> ${blockIDData.blockId || 'N/A'}</small><br>
        <small><strong>Blockchain Hash:</strong> ${blockIDData.blockchainHash ? blockIDData.blockchainHash.substring(0, 20) + '...' : 'N/A'}</small><br>
        ${blockIDData.verifiedOn ? `<small><strong>Verified:</strong> ${new Date(blockIDData.verifiedOn).toLocaleDateString()}</small>` : ''}
      </div>
    `;
  } else {
    panelContent.innerHTML = `
      <div class="blockid-pending">
        <i class="fas fa-clock text-warning me-2"></i>
        <strong>KYC Pending</strong>
      </div>
    `;
  }

  blockIDPanel.innerHTML = '';
  blockIDPanel.appendChild(panelContent);
}
