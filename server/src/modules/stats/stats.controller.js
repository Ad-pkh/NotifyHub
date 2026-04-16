import * as statsService from './stats.service.js';

export const overview = async (req, res, next) => {
  try {
    const data = await statsService.getOverview(req);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
