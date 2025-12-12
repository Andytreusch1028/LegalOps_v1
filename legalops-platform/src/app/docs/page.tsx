'use client';

import { useEffect, useState } from 'react';

export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load API spec:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Documentation</h1>
          <p className="text-gray-600">Unable to load the API specification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">LegalOps Platform API Documentation</h1>
            <p className="mt-2 text-gray-600">
              Interactive API documentation for the LegalOps business formation platform.
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">API Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="text-sm text-gray-900">{spec.info?.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Base URL</dt>
                    <dd className="text-sm text-gray-900">{spec.servers?.[0]?.url}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Endpoints</h2>
              <div className="space-y-2">
                {spec.paths && Object.entries(spec.paths).map(([path, methods]) => (
                  <div key={path} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{path}</h3>
                    <div className="space-y-1">
                      {Object.entries(methods).map(([method, details]) => (
                        <div key={method} className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            method.toUpperCase() === 'GET' ? 'bg-green-100 text-green-800' :
                            method.toUpperCase() === 'POST' ? 'bg-blue-100 text-blue-800' :
                            method.toUpperCase() === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            method.toUpperCase() === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {method.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">{details.summary || 'No summary'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Interactive Documentation</h3>
              <p className="text-sm text-blue-700 mb-3">
                For full interactive documentation with request/response examples and testing capabilities, 
                you can use external tools like Swagger UI or Postman.
              </p>
              <div className="space-y-2">
                <div>
                  <strong className="text-sm text-blue-900">OpenAPI Spec URL:</strong>
                  <code className="ml-2 text-sm bg-blue-100 px-2 py-1 rounded">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/docs
                  </code>
                </div>
                <div>
                  <strong className="text-sm text-blue-900">Swagger UI:</strong>
                  <span className="ml-2 text-sm text-blue-700">
                    Import the spec URL into{' '}
                    <a 
                      href="https://editor.swagger.io/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      Swagger Editor
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}