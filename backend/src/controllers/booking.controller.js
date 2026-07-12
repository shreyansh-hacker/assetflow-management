const bookingService = require('../services/booking.service');
const { successResponse, errorResponse } = require('../utils/response');

class BookingController {
  async getAll(req, res) {
    try {
      const bookings = await bookingService.getAll();
      return successResponse(res, 'Bookings fetched', bookings);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      // In this system, user creating the booking could be req.body.userId (if Admin) or req.user.id
      const userId = req.body.userId || req.user.id;
      const result = await bookingService.create({ ...req.body, userId }, req.user.id);
      return successResponse(res, 'Booking created', result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const result = await bookingService.update(req.params.id, req.body, req.user.id);
      return successResponse(res, 'Booking updated', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await bookingService.delete(req.params.id, req.user.id);
      return successResponse(res, 'Booking cancelled');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new BookingController();
