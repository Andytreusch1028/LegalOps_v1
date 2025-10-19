// Complete test script to verify USPS OAuth and Address Validation
const clientId = '0A9LshMbDq7QZg9ElSfBGG1ySf2j20jJkL18WjfbbhKXXK69';
const clientSecret = 'xQLAzyqSTWIDHH8BVjGrFKz67w9PzML6JwCfsSN0A7RRFWJsNG3AyiBfLdiYcJGZ';

async function testUSPS() {
  console.log('=== USPS API Complete Test ===\n');

  // Step 1: Get OAuth Token
  console.log('Step 1: Getting OAuth Token...');
  try {
    const tokenResponse = await fetch('https://apis.usps.com/oauth2/v3/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ OAuth Failed:', tokenResponse.status, errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ OAuth Success! Token:', accessToken.substring(0, 20) + '...\n');

    // Step 2: Validate Address (using a real address - Miami-Dade County Courthouse)
    console.log('Step 2: Validating Address...');
    const params = new URLSearchParams({
      streetAddress: '73 W Flagler St',
      city: 'Miami',
      state: 'FL',
    });

    const addressResponse = await fetch(`https://apis.usps.com/addresses/v3/address?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Address API Status:', addressResponse.status, addressResponse.statusText);
    const addressText = await addressResponse.text();
    console.log('Address API Response:', addressText);

    if (addressResponse.ok) {
      const addressData = JSON.parse(addressText);
      console.log('\n✅ ADDRESS VALIDATION SUCCESS!');
      console.log('Validated Address:', JSON.stringify(addressData, null, 2));
    } else {
      console.log('\n❌ ADDRESS VALIDATION FAILED');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testUSPS();

