const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return errorResponse(res, 'Validation failed', 422, extractedErrors);
};

const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const assetValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('assetCode').notEmpty().withMessage('Asset Code is required'),
  body('serialNumber').notEmpty().withMessage('Serial Number is required'),
  body('categoryId').isInt().withMessage('Valid Category ID is required'),
  body('departmentId').isInt().withMessage('Valid Department ID is required'),
  validate
];

const bookingValidation = [
  body('assetId').isInt().withMessage('Valid Asset ID is required'),
  body('startDate').isISO8601().withMessage('Valid Start Date is required'),
  body('endDate').isISO8601().withMessage('Valid End Date is required'),
  validate
];

module.exports = {
  signupValidation,
  assetValidation,
  bookingValidation,
  validate
};
