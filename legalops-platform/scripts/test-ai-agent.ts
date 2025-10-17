/**
 * Test Script for AI Filing Agent
 * 
 * Tests the Sunbiz form filling automation
 */

import { SunbizFilingAgent, LLCFormationData } from '../src/lib/sunbiz-agent';

async function testLLCFormation() {
  console.log('🧪 Testing AI Filing Agent - LLC Formation\n');

  const agent = new SunbizFilingAgent('./public/filing-screenshots');

  // Test data
  const testData: LLCFormationData = {
    businessName: 'Test Automation LLC',
    principalAddress: {
      street: '123 Test Street',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
    },
    mailingAddress: {
      street: 'PO Box 456',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
    },
    registeredAgent: {
      name: 'John Doe',
      address: {
        street: '789 Agent Avenue',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
      },
    },
    managers: [
      {
        name: 'Jane Smith',
        address: '123 Manager Lane, Miami, FL 33101',
        type: 'MGR',
      },
    ],
    correspondenceEmail: '[email protected]',
  };

  try {
    console.log('📝 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n🤖 Starting AI agent...\n');

    // Fill the form (headless=false to see the browser)
    const result = await agent.fillLLCFormation(testData, false);

    console.log('\n📊 Results:');
    console.log('Success:', result.success);
    console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%');
    console.log('Screenshot saved:', result.screenshot ? 'Yes' : 'No');
    
    if (result.errors && result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }

    console.log('\n⏸️  Browser is open for manual inspection.');
    console.log('Press Ctrl+C to close the browser and exit.\n');

    // Keep the script running so you can inspect the browser
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await agent.close();
  }
}

// Run the test
testLLCFormation();

