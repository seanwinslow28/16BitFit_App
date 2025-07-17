// FigmaService.js - Enhanced to work with multiple 16BitFit Figma files
import { FIGMA_ACCESS_TOKEN, EXPO_PUBLIC_FIGMA_ACCESS_TOKEN } from '@env';

class FigmaService {
  constructor() {
    // Try different environment variable approaches
    this.figmaToken = FIGMA_ACCESS_TOKEN || 
                     EXPO_PUBLIC_FIGMA_ACCESS_TOKEN || 
                     process.env.EXPO_PUBLIC_FIGMA_ACCESS_TOKEN;
    
    // 16BitFit Figma Files
    this.fileIds = {
      test: 'Z6IqoQbAlsaRkxdoymtVK4',      // Original test file
      main: 'vHtsDDAILWiPSGmYzFmFLq',      // Main design system file
    };
    
    this.currentFile = 'main'; // Default to main design system
    
    if (!this.figmaToken) {
      console.warn('⚠️  Figma token not found. Please add FIGMA_ACCESS_TOKEN to your .env file');
    }
  }

  // Switch between different 16BitFit files
  setActiveFile(fileKey) {
    if (this.fileIds[fileKey]) {
      this.currentFile = fileKey;
      console.log(`📁 Switched to ${fileKey} file: ${this.fileIds[fileKey]}`);
    } else {
      console.error(`❌ Unknown file key: ${fileKey}`);
    }
  }

  // Get current file ID
  getCurrentFileId() {
    return this.fileIds[this.currentFile];
  }

  // Get file information from Figma
  async getFile(fileId = null) {
    if (!this.figmaToken) {
      throw new Error('Figma token not configured');
    }

    const targetFileId = fileId || this.getCurrentFileId();

    try {
      const response = await fetch(`https://api.figma.com/v1/files/${targetFileId}`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Log which file we're accessing
      console.log(`📄 Accessed: ${data.name} (${this.currentFile})`);
      
      return data;
    } catch (error) {
      console.error('Error fetching from Figma:', error);
      throw error;
    }
  }

  // Get project images
  async getImages(fileId = null, nodeIds = []) {
    if (!this.figmaToken) {
      throw new Error('Figma token not configured');
    }

    const targetFileId = fileId || this.getCurrentFileId();

    try {
      const nodeQuery = nodeIds.length > 0 ? `?ids=${nodeIds.join(',')}` : '';
      const response = await fetch(`https://api.figma.com/v1/images/${targetFileId}${nodeQuery}`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching images from Figma:', error);
      throw error;
    }
  }

  // Get specific node information
  async getNode(nodeId, fileId = null) {
    if (!this.figmaToken) {
      throw new Error('Figma token not configured');
    }

    const targetFileId = fileId || this.getCurrentFileId();

    try {
      const response = await fetch(`https://api.figma.com/v1/files/${targetFileId}/nodes?ids=${nodeId}`, {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching node from Figma:', error);
      throw error;
    }
  }

  // Test the connection
  async testConnection() {
    if (!this.figmaToken) {
      return { success: false, error: 'No token configured' };
    }

    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': this.figmaToken,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return { success: true, user: userData };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all available files info
  async getAllFilesInfo() {
    const filesInfo = {};
    
    for (const [key, fileId] of Object.entries(this.fileIds)) {
      try {
        const data = await this.getFile(fileId);
        filesInfo[key] = {
          id: fileId,
          name: data.name,
          lastModified: data.lastModified,
          version: data.version,
          pages: data.document?.children?.length || 0
        };
      } catch (error) {
        filesInfo[key] = {
          id: fileId,
          error: error.message
        };
      }
    }
    
    return filesInfo;
  }
}

export default new FigmaService(); 