// IPFS Service - InterPlanetary File System for decentralized document storage
// Simulates IPFS file upload and storage

class IPFSService {
  constructor() {
    this.baseURL = 'https://ipfs.tatacapital.com';
    this.files = new Map(); // Simulated IPFS storage
  }

  // Upload file to IPFS
  async uploadFile(file, metadata = {}) {
    const startTime = Date.now();
    const endpoint = `${this.baseURL}/api/v0/add`;
    const method = 'POST';
    const request = { fileName: file.name, fileSize: file.size, type: file.type };

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate IPFS hash (simulated)
      const ipfsHash = this.generateIPFSHash(file.name);
      const cid = `Qm${Array(44).fill(0).map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('')}`;

      // Store file metadata
      this.files.set(ipfsHash, {
        cid: cid,
        hash: ipfsHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        metadata: metadata,
        ipfsUrl: `https://ipfs.io/ipfs/${cid}`,
        gatewayUrl: `https://gateway.ipfs.io/ipfs/${cid}`
      });

      // Create blockchain transaction for file storage
      if (window.blockchainService) {
        window.blockchainService.createBlock([{
          from: 'IPFS Service',
          to: 'Blockchain Storage',
          type: 'FILE_UPLOAD',
          data: {
            cid: cid,
            hash: ipfsHash,
            fileName: file.name,
            fileType: file.type
          },
          timestamp: new Date().toISOString()
        }], 'IPFS_STORAGE');
      }

      const response = {
        success: true,
        data: {
          cid: cid,
          hash: ipfsHash,
          ipfsUrl: `https://ipfs.io/ipfs/${cid}`,
          gatewayUrl: `https://gateway.ipfs.io/ipfs/${cid}`,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
      };

      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('IPFS Service', endpoint, method, request, response, 'SUCCESS', duration);
      }

      // Show IPFS upload notification
      this.showIPFSUploadNotification(cid, file.name);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (window.apiServers && window.apiServers.logger) {
        window.apiServers.logger.log('IPFS Service', endpoint, method, request, { error: error.message }, 'ERROR', duration);
      }
      throw error;
    }
  }

  // Generate IPFS hash (simulated)
  generateIPFSHash(fileName) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const hash = btoa(fileName + timestamp + random).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return hash;
  }

  // Get file from IPFS
  async getFile(ipfsHash) {
    const file = this.files.get(ipfsHash);
    if (!file) {
      return { success: false, error: 'File not found' };
    }

    return {
      success: true,
      data: file
    };
  }

  // Show IPFS upload notification
  showIPFSUploadNotification(cid, fileName) {
    const ipfsPanel = document.getElementById('ipfsPanel');
    if (!ipfsPanel) return;

    const notification = document.createElement('div');
    notification.className = 'ipfs-notification';
    notification.innerHTML = `
      <div class="ipfs-notification-header">
        <i class="fas fa-cloud-upload-alt text-primary"></i>
        <span class="ms-2">File Uploaded to IPFS</span>
      </div>
      <div class="ipfs-notification-body">
        <div><strong>File:</strong> ${fileName}</div>
        <div><strong>CID:</strong> <code>${cid}</code></div>
        <div><strong>IPFS URL:</strong> <a href="https://ipfs.io/ipfs/${cid}" target="_blank" class="text-primary">View on IPFS</a></div>
      </div>
    `;

    ipfsPanel.appendChild(notification);
    ipfsPanel.scrollTop = ipfsPanel.scrollHeight;

    // Animate
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    setTimeout(() => {
      notification.style.transition = 'all 0.3s ease';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
  }
}

// Initialize IPFS Service
const ipfsService = new IPFSService();
window.ipfsService = ipfsService;

