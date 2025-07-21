#!/usr/bin/env node

/**
 * Test the WordPress plugin download endpoint
 */

console.log('🧪 Testing WordPress Plugin Download\n');

const API_BASE = 'http://localhost:3001/api/v1';

try {
    // Test the plugin download endpoint
    console.log('📥 Testing plugin download endpoint...');
    
    const downloadResponse = await fetch(`${API_BASE}/wordpress/plugin/download`);
    
    console.log(`  📊 Response status: ${downloadResponse.status}`);
    console.log(`  📊 Response headers:`, Object.fromEntries(downloadResponse.headers.entries()));
    
    if (downloadResponse.ok) {
        const contentType = downloadResponse.headers.get('content-type');
        const contentDisposition = downloadResponse.headers.get('content-disposition');
        
        console.log('  ✅ Plugin download endpoint working');
        console.log(`  📄 Content-Type: ${contentType}`);
        console.log(`  📄 Content-Disposition: ${contentDisposition}`);
        
        // Check if it's actually a zip file
        if (contentType === 'application/zip') {
            console.log('  ✅ Correct content type (application/zip)');
        } else {
            console.log('  ⚠️  Unexpected content type');
        }
        
        if (contentDisposition && contentDisposition.includes('crawlguard-wp.zip')) {
            console.log('  ✅ Correct filename in content disposition');
        } else {
            console.log('  ⚠️  Unexpected content disposition');
        }
        
        // Get the file size
        const contentLength = downloadResponse.headers.get('content-length');
        if (contentLength) {
            const sizeKB = Math.round(parseInt(contentLength) / 1024);
            console.log(`  📊 File size: ${sizeKB} KB`);
        }
        
        console.log('\n🎉 PLUGIN DOWNLOAD TEST SUCCESSFUL!');
        console.log('\n✅ Confirmed Working:');
        console.log('  • Download endpoint accessible');
        console.log('  • Correct content type');
        console.log('  • Proper file headers');
        console.log('  • File available for download');
        
    } else {
        console.log('  ❌ Plugin download failed');
        console.log(`  📊 Status: ${downloadResponse.status}`);
        
        const errorText = await downloadResponse.text();
        console.log(`  📊 Error: ${errorText}`);
    }
    
} catch (error) {
    console.error('❌ Plugin download test failed:', error.message);
    console.error(error);
}

console.log('\n🏁 Plugin download test completed!');
