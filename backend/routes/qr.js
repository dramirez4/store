const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

// Generate QR code for a batch
router.get('/:batchId', async (req, res) => {
  const { batchId } = req.params;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  
  const qrData = JSON.stringify({ batchId: parseInt(batchId) });
  
  try {
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M', // Medium error correction for better scanning
      type: 'image/png',
      quality: 0.92,
      margin: 2, // Smaller margin for better mobile scanning
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256 // Larger size for better mobile scanning
    });
    
    res.json({ qr: qrImage });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

module.exports = router; 