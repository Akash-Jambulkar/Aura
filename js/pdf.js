// PDF Generation for Sanction Letter
// Using jsPDF library

function downloadPDF() {
  const loanDataStr = sessionStorage.getItem('loanData');
  if (!loanDataStr) {
    alert('No loan data found. Please start a new application.');
    return;
  }
  
  const loanData = JSON.parse(loanDataStr);
  const customer = loanData.customer;
  const loan = loanData.loan;
  
  // Calculate EMI
  const principal = loan.amount;
  const rate = loan.interestRate / 12 / 100;
  const tenure = loan.tenure;
  const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - principal;
  
  // Create PDF using jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add logo/header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('TATA CAPITAL', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('LOAN SANCTION LETTER', 105, 30, { align: 'center' });
  
  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${dateStr}`, 20, 45);
  
  // Customer details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Dear ' + customer.name + ',', 20, 60);
  
  doc.setFontSize(10);
  let yPos = 70;
  doc.text(`We are pleased to inform you that your Personal Loan application has been approved.`, 20, yPos);
  yPos += 10;
  doc.text(`Following are the details of your sanctioned loan:`, 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('LOAN DETAILS', 20, yPos);
  
  yPos += 10;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Loan Amount: ₹${principal.toLocaleString('en-IN')}`, 25, yPos);
  yPos += 8;
  doc.text(`Loan Tenure: ${tenure} months`, 25, yPos);
  yPos += 8;
  doc.text(`Interest Rate: ${loan.interestRate}% per annum`, 25, yPos);
  yPos += 8;
  doc.text(`EMI Amount: ₹${Math.round(emi).toLocaleString('en-IN')} per month`, 25, yPos);
  yPos += 8;
  doc.text(`Total Interest: ₹${Math.round(totalInterest).toLocaleString('en-IN')}`, 25, yPos);
  yPos += 8;
  doc.text(`Total Amount Payable: ₹${Math.round(totalAmount).toLocaleString('en-IN')}`, 25, yPos);
  
  yPos += 15;
  doc.setFont(undefined, 'bold');
  doc.text('CUSTOMER DETAILS', 20, yPos);
  
  yPos += 10;
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${customer.name}`, 25, yPos);
  yPos += 8;
  doc.text(`Phone: ${customer.phone}`, 25, yPos);
  yPos += 8;
  doc.text(`Address: ${customer.address}`, 25, yPos);
  yPos += 8;
  doc.text(`Credit Score: ${customer.creditScore}/900`, 25, yPos);
  
  yPos += 15;
  doc.setFontSize(9);
  doc.text('Terms and Conditions:', 20, yPos);
  yPos += 8;
  doc.text('1. This sanction is valid for 30 days from the date of issue.', 25, yPos);
  yPos += 8;
  doc.text('2. Disbursement is subject to completion of all documentation.', 25, yPos);
  yPos += 8;
  doc.text('3. Interest rates are subject to change as per market conditions.', 25, yPos);
  yPos += 8;
  doc.text('4. Please contact us for any queries or clarifications.', 25, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.text('Thank you for choosing Tata Capital.', 20, yPos);
  yPos += 10;
  doc.text('Best Regards,', 20, yPos);
  yPos += 8;
  doc.setFont(undefined, 'bold');
  doc.text('Tata Capital Financial Services Ltd.', 20, yPos);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('This is a computer-generated document. No signature required.', 105, 280, { align: 'center' });
  
  // Save PDF
  const fileName = `Sanction_Letter_${customer.name.replace(/\s/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
  
  // Update UI
  const btn = document.querySelector('.btn-success');
  if (btn) {
    btn.textContent = '✅ Downloaded!';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-secondary');
    btn.disabled = true;
  }
}

// Load jsPDF library
function loadJSPDF() {
  if (window.jspdf) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadJSPDF();
  
  // Update result page with loan data
  const loanDataStr = sessionStorage.getItem('loanData');
  if (loanDataStr) {
    const loanData = JSON.parse(loanDataStr);
    const customer = loanData.customer;
    const loan = loanData.loan;
    
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    
    if (resultTitle && resultMessage) {
      if (loanData.result && loanData.result.status === 'approved') {
        resultTitle.textContent = '🎉 Loan Approved!';
        resultMessage.textContent = `Congratulations ${customer.name}! Your loan of ₹${loan.amount.toLocaleString('en-IN')} has been approved. Download your sanction letter below.`;
      } else {
        resultTitle.textContent = 'Loan Application Status';
        resultMessage.textContent = 'Your application is being processed.';
      }
    }
    
    // Show Smart Contract information if available
    if (loanData.smartContract) {
      const smartContractInfo = document.getElementById('smartContractInfo');
      if (smartContractInfo) {
        smartContractInfo.style.display = 'block';
        document.getElementById('contractId').textContent = loanData.smartContract.contractId;
        document.getElementById('contractHash').textContent = loanData.smartContract.contractHash.substring(0, 30) + '...';
        document.getElementById('blockchainAddress').textContent = loanData.smartContract.blockchainAddress.substring(0, 20) + '...';
        document.getElementById('ipfsHash').textContent = loanData.smartContract.ipfsHash || 'N/A';
        document.getElementById('contractLink').href = `#contract-${loanData.smartContract.contractId}`;
      }
    }
  }
});
