# Hybrid AI Implementation Quick Start Guide
*Step-by-step implementation of the AI-Ready MVP strategy*

---

## Phase 1: AI-Ready MVP Implementation (Months 1-3)

### Step 1: Set Up AI-Ready Architecture (Week 1)

#### 1.1 Environment Variables Setup
```bash
# .env.local
# Phase 1: Prepare for AI (don't activate yet)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
AI_ENABLED=false
AI_COMPLIANCE_MODE=strict
AI_MAX_TOKENS=1000
AI_TIMEOUT_MS=30000

# Existing environment variables
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_key
```

#### 1.2 Install AI Dependencies
```bash
# Install AI packages (prepare for Phase 2)
npm install openai @anthropic-ai/sdk zod
npm install @types/node-cron node-cron

# Install existing dependencies
npm install next react typescript prisma stripe
npm install @next-auth/prisma-adapter next-auth
npm install react-hook-form @hookform/resolvers
```

#### 1.3 Database Schema (AI-Ready)
```prisma
// schema.prisma - Add AI tables for Phase 2
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  // ... existing fields
  
  // AI-related fields (prepare for Phase 2)
  aiConversations AIConversation[]
  aiPreferences   Json?
  aiUsageLimit    Int      @default(100)
}

model AIConversation {
  id        String   @id @default(cuid())
  userId    String
  agentType String   // 'onboarding', 'support', 'document'
  messages  Json     // Array of messages
  metadata  Json?    // Context, compliance flags, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}

model AIAnalytics {
  id           String   @id @default(cuid())
  featureName  String   // 'chat', 'document_processing', etc.
  usageCount   Int      @default(0)
  successRate  Float?
  avgResponseTime Int?  // milliseconds
  totalCost    Float?   // USD
  date         DateTime @default(now())
  
  @@index([featureName, date])
}
```

### Step 2: Create AI Service Architecture (Week 1-2)

#### 2.1 AI Service Types
```typescript
// lib/ai/types.ts
export interface AIRequest {
  prompt: string;
  context: AIContext;
  agentType: 'onboarding' | 'support' | 'document' | 'workflow';
  userId: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  complianceChecked: boolean;
  requiresHumanReview: boolean;
  metadata: {
    model: string;
    tokens: number;
    responseTime: number;
    cost: number;
  };
}

export interface AIContext {
  userId: string;
  organizationId: string;
  conversationHistory: AIMessage[];
  userPreferences: AIPreferences;
  currentTask?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}
```

#### 2.2 Mock AI Service (Phase 1)
```typescript
// lib/ai/mock-service.ts
import { AIRequest, AIResponse } from './types';

export class MockAIService {
  async processRequest(request: AIRequest): Promise<AIResponse> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return realistic mock responses based on agent type
    const mockResponses = {
      onboarding: "I can help you get started with your business formation. What type of entity would you like to create?",
      support: "I understand you have a question about your order. Let me help you with that.",
      document: "I've analyzed your document. It appears to be complete and ready for processing.",
      workflow: "Your order is currently in processing. Estimated completion time is 3-5 business days."
    };
    
    return {
      content: mockResponses[request.agentType] || "I'm here to help with your legal operations needs.",
      confidence: 0.95,
      complianceChecked: true,
      requiresHumanReview: false,
      metadata: {
        model: 'mock-ai-v1',
        tokens: 50,
        responseTime: 500,
        cost: 0.001
      }
    };
  }
  
  async checkCompliance(content: string): Promise<boolean> {
    // Mock UPL compliance check
    const prohibitedTerms = ['legal advice', 'recommend', 'should do'];
    return !prohibitedTerms.some(term => content.toLowerCase().includes(term));
  }
}
```

#### 2.3 AI Service Manager (Phase 1 - Mock Implementation)
```typescript
// lib/ai/service-manager.ts
import { MockAIService } from './mock-service';
import { AIRequest, AIResponse } from './types';

export class AIServiceManager {
  private mockService: MockAIService;
  private isAIEnabled: boolean;
  
  constructor() {
    this.mockService = new MockAIService();
    this.isAIEnabled = process.env.AI_ENABLED === 'true';
  }
  
  async processRequest(request: AIRequest): Promise<AIResponse> {
    if (this.isAIEnabled) {
      // Phase 2: Use real AI services
      return this.processWithRealAI(request);
    } else {
      // Phase 1: Use mock service
      return this.mockService.processRequest(request);
    }
  }
  
  private async processWithRealAI(request: AIRequest): Promise<AIResponse> {
    // This will be implemented in Phase 2
    throw new Error('Real AI implementation coming in Phase 2');
  }
}
```

### Step 3: Create AI-Ready UI Components (Week 2-3)

#### 3.1 AI Chat Component
```typescript
// components/ai/AIChat.tsx
'use client';

import { useState } from 'react';
import { AIMessage } from '@/lib/ai/types';

interface AIChatProps {
  agentType: 'onboarding' | 'support' | 'document' | 'workflow';
  userId: string;
  initialMessage?: string;
}

export function AIChat({ agentType, userId, initialMessage }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          agentType,
          userId,
          context: { conversationHistory: messages }
        })
      });
      
      const aiResponse = await response.json();
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: aiResponse.metadata
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      // Fallback to helpful message
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: "I'm having trouble right now. Please contact our support team for assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="ai-chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
            <div className="timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="content">Thinking...</div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about your legal operations..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
      
      <div className="disclaimer">
        <small>
          This AI provides administrative assistance only and does not constitute legal advice.
          For legal guidance, consult with a qualified attorney.
        </small>
      </div>
    </div>
  );
}
```

#### 3.2 AI Chat API Route
```typescript
// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIServiceManager } from '@/lib/ai/service-manager';
import { getServerSession } from 'next-auth';

const aiService = new AIServiceManager();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { prompt, agentType, context } = await request.json();
    
    const aiRequest = {
      prompt,
      agentType,
      context: {
        ...context,
        userId: session.user.id
      },
      userId: session.user.id
    };
    
    const response = await aiService.processRequest(aiRequest);
    
    // Track usage for analytics
    await trackAIUsage({
      userId: session.user.id,
      agentType,
      success: true,
      responseTime: response.metadata.responseTime,
      cost: response.metadata.cost
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 500 }
    );
  }
}

async function trackAIUsage(data: any) {
  // Track AI usage for Phase 2 optimization
  // This will help with cost analysis and performance tuning
  console.log('AI Usage:', data);
  // TODO: Store in database for analytics
}
```

### Step 4: Integration Points for Phase 2

#### 4.1 Document Processing Hook
```typescript
// lib/documents/processor.ts
export class DocumentProcessor {
  async processDocument(file: File, userId: string) {
    if (process.env.AI_ENABLED === 'true') {
      // Phase 2: AI-powered document analysis
      return this.processWithAI(file, userId);
    } else {
      // Phase 1: Manual processing with AI preparation
      return this.processManually(file, userId);
    }
  }
  
  private async processManually(file: File, userId: string) {
    // Current manual processing
    // Store document metadata for AI training in Phase 2
    return {
      documentType: 'unknown', // AI will detect this in Phase 2
      extractedData: {}, // AI will extract this in Phase 2
      confidence: 1.0,
      requiresReview: true // AI will reduce this in Phase 2
    };
  }
  
  private async processWithAI(file: File, userId: string) {
    // Phase 2 implementation
    throw new Error('AI document processing coming in Phase 2');
  }
}
```

---

## Phase 2: AI Activation (Month 4)

### Step 1: Activate Real AI Services

#### 1.1 Update Environment Variables
```bash
# .env.local - Phase 2 activation
AI_ENABLED=true  # 🚀 ACTIVATE AI!
OPENAI_API_KEY=your_real_openai_key
ANTHROPIC_API_KEY=your_real_anthropic_key
```

#### 1.2 Real AI Service Implementation
```typescript
// lib/ai/openai-service.ts
import OpenAI from 'openai';
import { AIRequest, AIResponse } from './types';

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.agentType)
          },
          ...request.context.conversationHistory,
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
        temperature: 0.7
      });
      
      const responseTime = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || '';
      
      // UPL compliance check
      const complianceChecked = await this.checkCompliance(content);
      
      return {
        content: complianceChecked ? content : this.getComplianceResponse(),
        confidence: 0.95,
        complianceChecked,
        requiresHumanReview: !complianceChecked,
        metadata: {
          model: completion.model,
          tokens: completion.usage?.total_tokens || 0,
          responseTime,
          cost: this.calculateCost(completion.usage?.total_tokens || 0)
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
  
  private getSystemPrompt(agentType: string): string {
    const basePrompt = `You are an AI assistant for LegalOps, a legal operations platform. 
    You provide ADMINISTRATIVE ASSISTANCE ONLY and do not provide legal advice.
    Always include appropriate disclaimers about not providing legal advice.
    If asked for legal advice, redirect to consulting with a qualified attorney.`;
    
    const agentPrompts = {
      onboarding: `${basePrompt} You help users understand the administrative process of business formation.`,
      support: `${basePrompt} You help users with platform questions and order status.`,
      document: `${basePrompt} You help with administrative document processing and organization.`,
      workflow: `${basePrompt} You provide administrative updates on workflow status.`
    };
    
    return agentPrompts[agentType] || basePrompt;
  }
  
  private async checkCompliance(content: string): Promise<boolean> {
    // Implement UPL compliance checking
    const prohibitedPatterns = [
      /you should.*legal/i,
      /i recommend.*legal/i,
      /legal advice/i,
      /this means.*law/i
    ];
    
    return !prohibitedPatterns.some(pattern => pattern.test(content));
  }
  
  private getComplianceResponse(): string {
    return "I can only provide administrative assistance. For legal guidance on this matter, please consult with a qualified attorney. I can help you with administrative tasks and platform questions.";
  }
  
  private calculateCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    // Simplified calculation
    return (tokens / 1000) * 0.045; // Average cost
  }
}
```

### Step 2: Update Service Manager for Real AI
```typescript
// lib/ai/service-manager.ts - Phase 2 Update
import { OpenAIService } from './openai-service';
import { MockAIService } from './mock-service';

export class AIServiceManager {
  private openaiService: OpenAIService;
  private mockService: MockAIService;
  private isAIEnabled: boolean;
  
  constructor() {
    this.openaiService = new OpenAIService();
    this.mockService = new MockAIService();
    this.isAIEnabled = process.env.AI_ENABLED === 'true';
  }
  
  async processRequest(request: AIRequest): Promise<AIResponse> {
    if (this.isAIEnabled) {
      try {
        return await this.openaiService.processRequest(request);
      } catch (error) {
        console.error('AI service error, falling back to mock:', error);
        return await this.mockService.processRequest(request);
      }
    } else {
      return await this.mockService.processRequest(request);
    }
  }
}
```

---

## Success Metrics & Monitoring

### Phase 1 Success Criteria (Month 3)
- [ ] 10+ paying customers using the platform
- [ ] $3,000+ monthly recurring revenue
- [ ] AI-ready architecture validated
- [ ] Mock AI services working correctly

### Phase 2 Success Criteria (Month 6)
- [ ] 50+ customers using AI features
- [ ] $15,000+ monthly recurring revenue
- [ ] >95% AI response accuracy
- [ ] <2 second AI response times
- [ ] 100% UPL compliance rate

This implementation guide provides the exact code and steps needed to build your AI-ready MVP and then activate AI capabilities when you're ready for Phase 2.
