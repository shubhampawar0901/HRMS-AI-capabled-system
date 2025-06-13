const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    service: 'reports-service',
    status: 'ready for implementation'
  });
});

module.exports = router;
