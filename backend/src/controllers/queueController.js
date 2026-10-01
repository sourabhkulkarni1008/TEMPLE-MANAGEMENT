import { db } from '../data/store.js';

/**
 * Get active queues status
 * GET /api/queue
 */
export const getQueueStatus = async (req, res, next) => {
  try {
    const queues = [...db.data.queues];
    res.json({
      success: true,
      queues
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Advance queue to Next Token (Staff action)
 * POST /api/queue/next
 */
export const advanceNextToken = async (req, res, next) => {
  try {
    const { queueId = 'q-1' } = req.body;
    const queue = db.findById('queues', queueId);

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found.' });
    }

    if (queue.status === 'PAUSED') {
      return res.status(400).json({ success: false, message: 'Queue is currently paused. Please resume first.' });
    }

    // Parse token prefix and number (e.g. "A-142" -> "A", 142)
    const match = queue.currentServingToken.match(/([A-Z]+)-?(\d+)/);
    let nextToken = 'A-101';
    if (match) {
      const prefix = match[1];
      const nextNum = parseInt(match[2], 10) + 1;
      nextToken = `${prefix}-${nextNum}`;
    }

    const newWaiting = Math.max(0, queue.waitingCount - 1);
    const updated = db.update('queues', queue.id, {
      currentServingToken: nextToken,
      waitingCount: newWaiting,
      estimatedWaitTimeMins: Math.ceil(newWaiting * 0.45)
    });

    res.json({
      success: true,
      message: `Queue advanced to token ${nextToken}`,
      queue: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Pause Queue
 * POST /api/queue/pause
 */
export const pauseQueue = async (req, res, next) => {
  try {
    const { queueId = 'q-1' } = req.body;
    const queue = db.findById('queues', queueId);

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found.' });
    }

    const updated = db.update('queues', queue.id, { status: 'PAUSED' });

    res.json({
      success: true,
      message: 'Queue has been paused.',
      queue: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Resume Queue
 * POST /api/queue/resume
 */
export const resumeQueue = async (req, res, next) => {
  try {
    const { queueId = 'q-1' } = req.body;
    const queue = db.findById('queues', queueId);

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found.' });
    }

    const updated = db.update('queues', queue.id, { status: 'ACTIVE' });

    res.json({
      success: true,
      message: 'Queue has been resumed.',
      queue: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Waiting Count or Token manually
 * PUT /api/queue/:id
 */
export const updateQueueManual = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentServingToken, waitingCount, status } = req.body;

    const updates = {};
    if (currentServingToken) updates.currentServingToken = currentServingToken;
    if (waitingCount !== undefined) {
      updates.waitingCount = Math.max(0, parseInt(waitingCount, 10));
      updates.estimatedWaitTimeMins = Math.ceil(updates.waitingCount * 0.45);
    }
    if (status) updates.status = status;

    const updated = db.update('queues', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Queue not found.' });
    }

    res.json({
      success: true,
      message: 'Queue updated successfully.',
      queue: updated
    });
  } catch (err) {
    next(err);
  }
};
