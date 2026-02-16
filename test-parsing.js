// Test script to verify API response parsing issue

// Simulate what .text() returns - raw string with escaped newlines as written in JSON
const rawTextResponse = String.raw`"{\n  id: 1u64,\n  creator: aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv,\n  market_type: 1u8,\n  yes_reserves: 50000000u64,\n  no_reserves: 50000000u64,\n  status: 0u8\n}"`;

// Simulate what .json() returns - parsed JSON value
const jsonParsedResponse = `{
  id: 1u64,
  creator: aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv,
  market_type: 1u8,
  yes_reserves: 50000000u64,
  no_reserves: 50000000u64,
  status: 0u8
}`;

console.log('=== Using .text() (current approach) ===');
console.log('Raw:', rawTextResponse);
console.log('Length:', rawTextResponse.length);
console.log('First char:', rawTextResponse[0]);
console.log('Last char:', rawTextResponse[rawTextResponse.length - 1]);

console.log('\n=== Using .json() (correct approach) ===');
console.log('Parsed:', jsonParsedResponse);
console.log('Length:', jsonParsedResponse.length);
console.log('First char:', jsonParsedResponse[0]);
console.log('Last char:', jsonParsedResponse[jsonParsedResponse.length - 1]);

// Test the regex extraction
function extract(text, key) {
  const re = new RegExp(`${key}:\\s*([^,}]+)`);
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function stripTypeSuffix(val) {
  return val.replace(/u\d+$/, '');
}

console.log('\n=== Extraction from .text() response ===');
const statusFromText = extract(rawTextResponse, 'status');
console.log('Extracted status:', JSON.stringify(statusFromText));
console.log('After strip suffix:', JSON.stringify(stripTypeSuffix(statusFromText)));

console.log('\n=== Extraction from .json() response ===');
const statusFromJson = extract(jsonParsedResponse, 'status');
console.log('Extracted status:', JSON.stringify(statusFromJson));
console.log('After strip suffix:', JSON.stringify(stripTypeSuffix(statusFromJson)));
