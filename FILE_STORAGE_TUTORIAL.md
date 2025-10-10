# File Storage & Document Management Tutorial for VBA Developers

## Overview for VBA Background
Think of cloud file storage like a network drive in VBA - you can save files, retrieve them, and organize them in folders. But instead of `SaveAs "C:\Documents\file.pdf"`, you're saving to AWS S3 or Vercel Blob with URLs and security.

---

## Step 1: Choose Your Storage Solution (10 minutes)

### Option A: Vercel Blob (Easier for beginners)
- **Pros:** Simple setup, integrates with Vercel deployment
- **Cons:** More expensive at scale, newer service
- **Best for:** Getting started quickly

### Option B: AWS S3 (Industry standard)
- **Pros:** Cheaper, more features, industry standard
- **Cons:** More complex setup, AWS learning curve
- **Best for:** Production applications

**Recommendation:** Start with Vercel Blob, migrate to S3 later if needed.

---

## Step 2: Vercel Blob Setup (15 minutes)

### Install Vercel Blob
```bash
npm install @vercel/blob
```

### Environment Variables (.env.local)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

### Basic Upload Function (lib/storage.ts)
```typescript
import { put, del, list } from '@vercel/blob';

export async function uploadFile(file: File, folder: string = 'documents') {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`;
    
    const blob = await put(filename, file, {
      access: 'public', // or 'private' for sensitive docs
    });

    return {
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('File upload failed');
  }
}

export async function deleteFile(filename: string) {
  try {
    await del(filename);
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}

export async function listFiles(folder: string = 'documents') {
  try {
    const { blobs } = await list({
      prefix: folder,
    });
    return blobs;
  } catch (error) {
    console.error('List failed:', error);
    return [];
  }
}
```

---

## Step 3: File Upload Component (30 minutes)

### Upload Component (components/FileUpload.tsx)
```typescript
import { useState, useRef } from 'react';

interface FileUploadProps {
  onUploadComplete: (fileData: any) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  folder?: string;
}

export default function FileUpload({
  onUploadComplete,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.png',
  maxSize = 10,
  folder = 'documents'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    // Validate file size (like VBA file size check)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type not allowed. Accepted: ${acceptedTypes}`);
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const fileData = await response.json();
      onUploadComplete(fileData);
      
      // Clear the input (like clearing VBA form)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-gray-500">
              Accepted: {acceptedTypes} (Max: {maxSize}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 4: Upload API Endpoint (20 minutes)

### API Route (pages/api/upload.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'documents';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file data
    const fileData = fs.readFileSync(file.filepath);
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}-${file.originalFilename}`;

    // Upload to Vercel Blob
    const blob = await put(filename, fileData, {
      access: 'private', // Use 'private' for sensitive documents
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    // Return file information
    res.status(200).json({
      url: blob.url,
      filename: blob.pathname,
      originalName: file.originalFilename,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
```

---

## Step 5: Document Management for RA Communications (45 minutes)

### RA Document Upload (components/RADocumentUpload.tsx)
```typescript
import { useState } from 'react';
import FileUpload from './FileUpload';

interface RADocumentUploadProps {
  customerId: string;
  onDocumentUploaded: () => void;
}

export default function RADocumentUpload({ customerId, onDocumentUploaded }: RADocumentUploadProps) {
  const [documentType, setDocumentType] = useState('legal_notice');
  const [description, setDescription] = useState('');

  const handleUploadComplete = async (fileData: any) => {
    try {
      // Save document info to database
      const response = await fetch('/api/ra-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          documentType,
          description,
          fileName: fileData.originalName,
          fileUrl: fileData.url,
          fileSize: fileData.size,
          uploadedAt: fileData.uploadedAt,
        }),
      });

      if (response.ok) {
        // Send notification to customer
        await fetch('/api/notifications/document-ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            documentType,
            description,
          }),
        });

        alert('Document uploaded and customer notified!');
        onDocumentUploaded();
        setDescription('');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document information');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upload RA Document</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Document Type</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="legal_notice">Legal Notice</option>
          <option value="state_correspondence">State Correspondence</option>
          <option value="tax_document">Tax Document</option>
          <option value="court_document">Court Document</option>
          <option value="general_mail">General Mail</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the document..."
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <FileUpload
        onUploadComplete={handleUploadComplete}
        acceptedTypes=".pdf,.jpg,.png,.doc,.docx"
        maxSize={25}
        folder={`ra-documents/${customerId}`}
      />
    </div>
  );
}
```

### Customer Document Viewer (components/DocumentViewer.tsx)
```typescript
import { useState, useEffect } from 'react';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
  description: string;
  uploadedAt: string;
  isRead: boolean;
}

export default function DocumentViewer({ customerId }: { customerId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/documents`);
      const docs = await response.json();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (documentId: string) => {
    try {
      await fetch(`/api/documents/${documentId}/mark-read`, {
        method: 'POST',
      });
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId ? { ...doc, isRead: true } : doc
        )
      );
    } catch (error) {
      console.error('Error marking document as read:', error);
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      // Mark as read when downloaded
      if (!document.isRead) {
        await markAsRead(document.id);
      }

      // Create download link (like VBA SaveAs dialog)
      const link = document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.fileName;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Documents</h3>
      
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents available</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`border rounded p-4 ${!doc.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{doc.fileName}</h4>
                    {!doc.isRead && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {doc.documentType.replace('_', ' ')} • 
                    Received: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <button
                  onClick={() => downloadDocument(doc)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Security & Access Control (20 minutes)

### Secure File Access
```typescript
// pages/api/documents/[id]/download.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user is logged in
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const documentId = req.query.id as string;
  
  try {
    // Check if user has access to this document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        customerId: session.user.id, // Only their documents
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Log the access for audit trail
    await prisma.documentAccess.create({
      data: {
        documentId,
        userId: session.user.id,
        accessedAt: new Date(),
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      },
    });

    // Return secure download URL
    res.status(200).json({
      downloadUrl: document.fileUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

  } catch (error) {
    console.error('Document access error:', error);
    res.status(500).json({ error: 'Access denied' });
  }
}
```

---

## Step 7: Testing Your File System (15 minutes)

### Testing Checklist
- [ ] Upload different file types (PDF, DOC, images)
- [ ] Test file size limits
- [ ] Verify security (can't access other users' files)
- [ ] Test download functionality
- [ ] Check audit logging
- [ ] Test drag-and-drop upload

### Common VBA Developer Gotchas

1. **File Paths**: Web uses URLs, not file paths
2. **Async Operations**: File operations are async
3. **Security**: Always verify user permissions
4. **File Size**: Web has size limits unlike VBA

This file storage system will handle all your RA document delivery needs!
