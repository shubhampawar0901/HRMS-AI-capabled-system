const express = require('express');
const router = express.Router();

// Placeholder routes for performance service
// These will be implemented by the Performance Service Agent

router.get('/health', (req, res) => {
  res.json({
    service: 'performance-service',
    status: 'ready for implementation',
    message: 'Performance service routes placeholder'
  });
});

// TODO: Implement by Performance Service Agent
// GET  /reviews
// POST /reviews
// GET  /goals
// POST /goals
// PUT  /goals/:id

module.exports = router;
