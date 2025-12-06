// Mock API Servers - CRM Server, Credit Bureau API, Offer Mart Server
// Complete API implementation with logging

// Access customer data from window (set by data.js)
// Do NOT redeclare dummyCustomers - it's already in data.js

class APILogger {
  constructor() {
    this.logs = [];
  }

  log(apiName, endpoint, method, request, response, status, duration) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      apiName,
      endpoint,
      method,
      request: JSON.stringify(request, null, 2),
      response: JSON.stringify(response, null, 2),
      status,
      duration: `${duration}ms`,
      timestampFull: new Date()
    };
    
    this.logs.push(logEntry);
    this.updateLogPanel(logEntry);
    return logEntry;
  }

  updateLogPanel(logEntry) {
    const logPanel = document.getElementById('apiLogsPanel');
    if (!logPanel) return;

    const logItem = document.createElement('div');
    logItem.className = `log-entry log-${logEntry.status.toLowerCase()}`;
    logItem.innerHTML = `
      <div class="log-header">
        <span class="log-time">${logEntry.timestamp}</span>
        <span class="log-api badge bg-primary">${logEntry.apiName}</span>
        <span class="log-method badge bg-info">${logEntry.method}</span>
        <span class="log-status badge bg-${logEntry.status === 'SUCCESS' ? 'success' : 'danger'}">${logEntry.status}</span>
        <span class="log-duration">${logEntry.duration}</span>
      </div>
      <div class="log-endpoint"><i class="fas fa-link me-1"></i>${logEntry.endpoint}</div>
      <div class="log-details">
        <div class="log-section">
          <strong>Request:</strong>
          <pre class="log-request">${logEntry.request}</pre>
        </div>
        <div class="log-section">
          <strong>Response:</strong>
          <pre class="log-response">${logEntry.response}</pre>
        </div>
      </div>
    `;

    logPanel.insertBefore(logItem, logPanel.firstChild);
    logPanel.scrollTop = 0;

    // Animate
    logItem.style.opacity = '0';
    logItem.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      logItem.style.transition = 'all 0.3s ease';
      logItem.style.opacity = '1';
      logItem.style.transform = 'translateX(0)';
    }, 10);
  }

  clearLogs() {
    this.logs = [];
    const logPanel = document.getElementById('apiLogsPanel');
    if (logPanel) {
      logPanel.innerHTML = '<div class="text-center text-muted p-3">No API calls yet...</div>';
    }
  }
}

const apiLogger = new APILogger();

// CRM Server - Customer Relationship Management
// Mock server for customer KYC data retrieval
class CRMServer {
  constructor() {
    this.serverName = 'CRM Server';
    this.baseURL = 'https://api.tatacapital.com/crm/v1';
    this.description = 'Customer Relationship Management - Stores and retrieves customer KYC data';
  }
  
  getCustomers() {
    // Get customers from window scope (set by data.js)
    const allCustomers = [];
    if (typeof window !== 'undefined' && window.dummyCustomers) {
      allCustomers.push(...window.dummyCustomers);
    }
    return allCustomers;
  }

  async getCustomer(phone) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/customers/${phone}`;
    const method = 'GET';
    const request = { phone };

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const customers = this.getCustomers();
      const customer = customers.find(c => c.phone === phone);
      const response = customer ? {
        success: true,
        data: {
          customerId: customer.customerId || `CUST${phone.slice(-6)}`,
          name: customer.name,
          phone: customer.phone,
          age: customer.age,
          city: customer.city,
          state: customer.state,
          address: customer.address,
          email: customer.email,
          pan: customer.pan,
          aadhar: customer.aadhar,
          kycStatus: customer.kycStatus || 'VERIFIED',
          registrationDate: customer.registrationDate || '2023-01-15',
          lastLogin: customer.lastLogin || new Date().toISOString(),
          employmentType: customer.employmentType,
          company: customer.company,
          workExperience: customer.workExperience,
          accountNumber: customer.accountNumber,
          ifsc: customer.ifsc
        }
      } : {
        success: false,
        error: 'Customer not found',
        message: 'No customer record found for the given phone number. Please contact customer service.'
      };

      const duration = Date.now() - startTime;
      apiLogger.log(this.serverName || 'CRM Server', endpoint, method, request, response, customer ? 'SUCCESS' : 'NOT_FOUND', duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.log('CRM Server', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      throw error;
    }
  }

}

// Credit Bureau API - Mock Credit Bureau Service
// Provides credit scores and credit reports
class CreditBureauAPI {
  constructor() {
    this.serverName = 'Credit Bureau API';
    this.baseURL = 'https://api.creditbureau.in/v1';
    this.description = 'Credit Bureau Service - Fetches credit scores and credit history';
  }

  async getCreditScore(phone) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/credit-score/${phone}`;
    const method = 'GET';
    const request = { phone };

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Get customer from window.dummyCustomers (set by data.js)
      let customer = null;
      if (typeof window !== 'undefined' && window.dummyCustomers) {
        customer = window.dummyCustomers.find(c => c.phone === phone);
      }

      const response = customer ? {
        success: true,
        data: {
          phone: customer.phone,
          creditScore: customer.creditScore,
          scoreRange: customer.creditScore >= 800 ? 'EXCELLENT' : 
                      customer.creditScore >= 750 ? 'VERY_GOOD' :
                      customer.creditScore >= 700 ? 'GOOD' : 'FAIR',
          lastUpdated: new Date().toISOString(),
          factors: {
            paymentHistory: customer.creditScore >= 750 ? 'EXCELLENT' : 'GOOD',
            creditUtilization: customer.currentLoan.amount > 0 ? 'MODERATE' : 'LOW',
            creditAge: customer.workExperience > 10 ? 'LONG' : 'MEDIUM',
            creditMix: customer.currentLoan.type === 'Home Loan' ? 'DIVERSE' : 'MODERATE'
          },
          reportId: `CR${Date.now()}`,
          currentLoanDetails: customer.currentLoan
        }
      } : {
        success: false,
        error: 'Credit report not found',
        message: 'No credit history found for this customer'
      };

      const duration = Date.now() - startTime;
      apiLogger.log(this.serverName || 'Credit Bureau API', endpoint, method, request, response, customer ? 'SUCCESS' : 'NOT_FOUND', duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.log('Credit Bureau API', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      throw error;
    }
  }

  async getCreditReport(phone) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/credit-report/${phone}`;
    const method = 'GET';
    const request = { phone };

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Get customer from window.dummyCustomers (set by data.js)
      let customer = null;
      if (typeof window !== 'undefined' && window.dummyCustomers) {
        customer = window.dummyCustomers.find(c => c.phone === phone);
      }

      const response = customer ? {
        success: true,
        data: {
          phone: customer.phone,
          creditScore: customer.creditScore,
          totalAccounts: 5,
          activeLoans: 1,
          totalDebt: customer.currentLoan.amount,
          paymentHistory: '95%',
          reportDate: new Date().toISOString()
        }
      } : null;

      const duration = Date.now() - startTime;
      apiLogger.log('Credit Bureau API', endpoint, method, request, response, response ? 'SUCCESS' : 'NOT_FOUND', duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.log('Credit Bureau API', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      throw error;
    }
  }
}

// Offer Mart Server - Pre-approved loan offers
// Mock server hosting pre-approved loan offers
class OfferMartServer {
  constructor() {
    this.serverName = 'Offer Mart Server';
    this.baseURL = 'https://api.tatacapital.com/offers/v1';
    this.description = 'Offer Mart - Hosts pre-approved loan offers and terms';
  }

  async getPreApprovedLimit(phone) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/pre-approved/${phone}`;
    const method = 'GET';
    const request = { phone };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get customer from window.dummyCustomers (set by data.js)
      let customer = null;
      if (typeof window !== 'undefined' && window.dummyCustomers) {
        customer = window.dummyCustomers.find(c => c.phone === phone);
      }

      const response = customer ? {
        success: true,
        data: {
          phone: customer.phone,
          customerId: customer.customerId,
          preApprovedLimit: customer.preApprovedLimit,
          interestRate: customer.creditScore >= 800 ? 11.5 : 
                        customer.creditScore >= 750 ? 12.0 : 
                        customer.creditScore >= 700 ? 12.5 : 13.5,
          offerType: 'PERSONAL_LOAN',
          validity: '30 days',
          offerId: `OFFER${Date.now()}`,
          terms: {
            minAmount: 50000,
            maxAmount: customer.preApprovedLimit,
            tenure: [12, 24, 36, 48, 60],
            processingFee: 0.02,
            prepaymentCharges: 0.04
          },
          eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minSalary: 25000,
            minCreditScore: 650
          },
          createdAt: new Date().toISOString(),
          offerDescription: `Pre-approved personal loan up to ₹${customer.preApprovedLimit.toLocaleString('en-IN')} based on your credit profile`
        }
      } : {
        success: false,
        error: 'No pre-approved offer found',
        message: 'Customer not eligible for pre-approved offers'
      };

      const duration = Date.now() - startTime;
      apiLogger.log(this.serverName || 'Offer Mart Server', endpoint, method, request, response, customer ? 'SUCCESS' : 'NOT_FOUND', duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.log('Offer Mart Server', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      throw error;
    }
  }

  async getAllOffers(phone) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/offers/${phone}`;
    const method = 'GET';
    const request = { phone };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get customer from window.dummyCustomers (set by data.js)
      let customer = null;
      if (typeof window !== 'undefined' && window.dummyCustomers) {
        customer = window.dummyCustomers.find(c => c.phone === phone);
      }

      const response = customer ? {
        success: true,
        data: {
          offers: [
            {
              type: 'PERSONAL_LOAN',
              amount: customer.preApprovedLimit,
              interestRate: 12.5,
              tenure: [12, 24, 36, 48, 60]
            },
            {
              type: 'HOME_LOAN',
              amount: customer.preApprovedLimit * 5,
              interestRate: 8.5,
              tenure: [60, 120, 180, 240]
            }
          ]
        }
      } : null;

      const duration = Date.now() - startTime;
      apiLogger.log('Offer Mart Server', endpoint, method, request, response, response ? 'SUCCESS' : 'NOT_FOUND', duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.log('Offer Mart Server', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      throw error;
    }
  }
}

// Initialize API servers immediately
const crmServer = new CRMServer();
const creditBureauAPI = new CreditBureauAPI();
const offerMartServer = new OfferMartServer();

// Export for use in other files - Initialize immediately
window.apiServers = {
  crm: crmServer,
  creditBureau: creditBureauAPI,
  offerMart: offerMartServer,
  logger: apiLogger
};

// Also set on load event as backup
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!window.apiServers) {
      window.apiServers = {
        crm: crmServer,
        creditBureau: creditBureauAPI,
        offerMart: offerMartServer,
        logger: apiLogger
      };
    }
    // Customer data is already available via window.dummyCustomers from data.js
  });
  
  // Also set immediately if DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.apiServers) {
      window.apiServers = {
        crm: crmServer,
        creditBureau: creditBureauAPI,
        offerMart: offerMartServer,
        logger: apiLogger
      };
    }
  }
}

// Initialize and verify
(function() {
  // Wait a bit for data.js to load
  setTimeout(() => {
    if (window.dummyCustomers) {
      console.log('✅ API Servers initialized with', window.dummyCustomers.length, 'customers:', {
        crm: !!crmServer,
        creditBureau: !!creditBureauAPI,
        offerMart: !!offerMartServer,
        logger: !!apiLogger,
        customersLoaded: window.dummyCustomers.length
      });
    } else {
      console.log('✅ API Servers initialized (waiting for customer data):', {
        crm: !!crmServer,
        creditBureau: !!creditBureauAPI,
        offerMart: !!offerMartServer,
        logger: !!apiLogger
      });
    }
  }, 100);
})();

