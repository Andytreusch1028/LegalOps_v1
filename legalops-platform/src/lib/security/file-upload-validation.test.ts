/**
 * Property-Based Tests for File Upload Validation
 * 
 * Feature: code-quality-improvements, Property 15: File Upload Validation
 * Validates: Requirements 6.3
 * 
 * Tests that file upload validation correctly rejects disallowed file types
 * and accepts only whitelisted types across a wide range of inputs.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { validateFileUpload } from '../utils/sanitization';

describe('Property 15: File Upload Validation', () => {
  /**
   * Property: Disallowed file types are rejected
   * 
   * For any file with a disallowed MIME type or extension,
   * the validation should fail and return appropriate errors.
   */
  test('disallowed file types are always rejected', () => {
    // Disallowed MIME types that should be rejected
    const disallowedTypes = [
      'application/x-msdownload',  // .exe
      'application/x-executable',
      'application/x-sh',          // Shell scripts
      'text/x-sh',
      'application/x-php',         // PHP files
      'text/x-php',
      'application/javascript',    // JavaScript
      'text/javascript',
      'application/x-python',      // Python scripts
      'text/x-python',
      'application/x-perl',        // Perl scripts
      'text/x-perl',
      'application/x-ruby',        // Ruby scripts
      'text/x-ruby',
      'application/x-bat',         // Batch files
      'application/x-msi',         // Windows installer
      'application/vnd.microsoft.portable-executable'
    ];
    
    // Disallowed extensions
    const disallowedExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
      '.js', '.vbs', '.wsf', '.sh', '.bash',
      '.php', '.py', '.rb', '.pl',
      '.msi', '.app', '.deb', '.rpm'
    ];
    
    const fileArbitrary = fc.record({
      name: fc.oneof(
        ...disallowedExtensions.map(ext => 
          fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}${ext}`)
        )
      ),
      type: fc.constantFrom(...disallowedTypes),
      size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }) // 1 byte to 10MB
    }).map(({ name, type, size }) => {
      // Create a mock File object
      return {
        name,
        type,
        size,
        lastModified: Date.now(),
        webkitRelativePath: '',
        arrayBuffer: async () => new ArrayBuffer(0),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => ''
      } as File;
    });
    
    fc.assert(
      fc.property(fileArbitrary, (file) => {
        const result = validateFileUpload(file, {
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
        });
        
        // File should be rejected
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Allowed file types are accepted (when size is valid)
   * 
   * For any file with an allowed MIME type, allowed extension,
   * and valid size, the validation should succeed.
   */
  test('allowed file types with valid sizes are accepted', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const validFileArbitrary = fc.record({
      basename: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
      extension: fc.constantFrom(...allowedExtensions),
      type: fc.constantFrom(...allowedTypes),
      size: fc.integer({ min: 1, max: maxSize })
    }).map(({ basename, extension, type, size }) => {
      return {
        name: `${basename}${extension}`,
        type,
        size,
        lastModified: Date.now(),
        webkitRelativePath: '',
        arrayBuffer: async () => new ArrayBuffer(0),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => ''
      } as File;
    });
    
    fc.assert(
      fc.property(validFileArbitrary, (file) => {
        const result = validateFileUpload(file, {
          allowedTypes,
          allowedExtensions,
          maxSize
        });
        
        // File should be accepted
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedFilename).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Files exceeding max size are rejected
   * 
   * For any file that exceeds the maximum allowed size,
   * validation should fail with a size error.
   */
  test('files exceeding max size are rejected', () => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const oversizedFileArbitrary = fc.record({
      name: fc.constantFrom('test.jpg', 'test.png', 'test.pdf'),
      type: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
      size: fc.integer({ min: maxSize + 1, max: maxSize * 10 })
    }).map(({ name, type, size }) => {
      return {
        name,
        type,
        size,
        lastModified: Date.now(),
        webkitRelativePath: '',
        arrayBuffer: async () => new ArrayBuffer(0),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => ''
      } as File;
    });
    
    fc.assert(
      fc.property(oversizedFileArbitrary, (file) => {
        const result = validateFileUpload(file, {
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
          maxSize
        });
        
        // File should be rejected due to size
        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('size') || err.includes('exceeds'))).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Filename sanitization removes dangerous characters
   * 
   * For any filename containing path traversal attempts or dangerous characters,
   * the sanitized filename should be safe.
   */
  test('filenames are sanitized to remove dangerous patterns', () => {
    const maliciousFilenameArbitrary = fc.oneof(
      // Path traversal attempts
      fc.constant('../../../etc/passwd'),
      fc.constant('..\\..\\..\\windows\\system32\\config\\sam'),
      fc.constant('./../../sensitive.txt'),
      
      // Dangerous characters
      fc.string({ minLength: 1, maxLength: 20 }).map(s => `${s}<script>.jpg`),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => `${s}|rm -rf.png`),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => `${s}; DROP TABLE.pdf`),
      
      // Null bytes
      fc.string({ minLength: 1, maxLength: 20 }).map(s => `${s}\x00.jpg`),
      
      // Very long filenames
      fc.string({ minLength: 300, maxLength: 500 }).map(s => `${s}.jpg`)
    );
    
    const fileArbitrary = fc.record({
      name: maliciousFilenameArbitrary,
      type: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf'),
      size: fc.integer({ min: 1, max: 1024 * 1024 })
    }).map(({ name, type, size }) => {
      return {
        name,
        type,
        size,
        lastModified: Date.now(),
        webkitRelativePath: '',
        arrayBuffer: async () => new ArrayBuffer(0),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => ''
      } as File;
    });
    
    fc.assert(
      fc.property(fileArbitrary, (file) => {
        const result = validateFileUpload(file, {
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
          maxSize: 5 * 1024 * 1024
        });
        
        // Sanitized filename should not contain dangerous patterns
        expect(result.sanitizedFilename).not.toContain('..');
        expect(result.sanitizedFilename).not.toContain('/');
        expect(result.sanitizedFilename).not.toContain('\\');
        expect(result.sanitizedFilename).not.toContain('<');
        expect(result.sanitizedFilename).not.toContain('>');
        expect(result.sanitizedFilename).not.toContain('|');
        expect(result.sanitizedFilename).not.toContain('\x00');
        expect(result.sanitizedFilename.length).toBeLessThanOrEqual(255);
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Type and extension must both match whitelist
   * 
   * For any file where either the MIME type OR extension is disallowed,
   * validation should fail (both must be allowed).
   */
  test('both MIME type and extension must be whitelisted', () => {
    // Files with mismatched type/extension
    const mismatchedFileArbitrary = fc.oneof(
      // Allowed type, disallowed extension
      fc.record({
        name: fc.constantFrom('test.exe', 'test.sh', 'test.bat'),
        type: fc.constantFrom('image/jpeg', 'image/png'),
        size: fc.integer({ min: 1, max: 1024 * 1024 })
      }),
      // Disallowed type, allowed extension
      fc.record({
        name: fc.constantFrom('test.jpg', 'test.png', 'test.pdf'),
        type: fc.constantFrom('application/x-msdownload', 'application/x-sh'),
        size: fc.integer({ min: 1, max: 1024 * 1024 })
      })
    ).map(({ name, type, size }) => {
      return {
        name,
        type,
        size,
        lastModified: Date.now(),
        webkitRelativePath: '',
        arrayBuffer: async () => new ArrayBuffer(0),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: async () => ''
      } as File;
    });
    
    fc.assert(
      fc.property(mismatchedFileArbitrary, (file) => {
        const result = validateFileUpload(file, {
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
          maxSize: 5 * 1024 * 1024
        });
        
        // File should be rejected
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
