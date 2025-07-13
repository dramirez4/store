const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();

// Generate QR code for a batch
router.get('/:batchId', async (req, res) => {
  const { batchId } = req.params;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  const qrData = JSON.stringify({ batchId });
  try {
    const qrImage = await QRCode.toDataURL(qrData);
    res.json({ qr: qrImage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

module.exports = router; 