/**
 * Module for UsersController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import createError from 'http-errors'
import User from '../models/user.js'

/**
 * Encapsulates a controller.
 */
export default class UsersController {
  /**
   * Creates a user account in database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    // Confirm that username is not taken.
    if (!await User.findOne({ username: req.body.username })) {
      try {
        // Create a user model.
        const user = new User({
          username: req.body.username,
          password: req.body.password
        })
        // Save user to the database.
        await user.save()
        res.status(201).send({ message: 'Account created successfully.' })
      } catch (error) {
        if (error.name === 'ValidationError') {
          next(createError(400, error.message))
        } else {
          next(createError(500))
        }
      }
    } else {
      // 400 Bad request (user already exists).
      next(createError(400))
    }
  }

  /**
   * Logs in a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      // Authenticate a user.
      const user = await User.authenticate(req.body.username, req.body.password)
      const token = user.generateSignedJwtToken()
      res.status(200).json({ success: true, token })
    } catch (error) {
      next(createError(401, error.message))
    }
  }
}
