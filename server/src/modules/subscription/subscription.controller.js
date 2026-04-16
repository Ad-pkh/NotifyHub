import * as subscriptionService from './subscription.service.js';

export const create = async (req, res, next) => {
  try {
    const data = await subscriptionService.create(req);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const data = await subscriptionService.list(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await subscriptionService.getById(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await subscriptionService.update(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await subscriptionService.remove(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const toggle = async (req, res, next) => {
  try {
    const data = await subscriptionService.toggle(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
