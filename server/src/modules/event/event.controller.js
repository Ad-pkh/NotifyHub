import * as eventService from './event.service.js';

export const publish = async (req, res, next) => {
  try {
    const data = await eventService.publishEvent(req);
    res.status(202).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const data = await eventService.listEvents(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await eventService.getEventById(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const retry = async (req, res, next) => {
  try {
    const data = await eventService.retryEvent(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
