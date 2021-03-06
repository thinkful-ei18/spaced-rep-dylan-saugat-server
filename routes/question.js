'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const passport = require('passport');
const { updatePosition } = require('../helpers/mValue');

router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  User.findById(req.user.id)
    .then(response => {
      let result = response.questions.head.value;
      delete result.answer;
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  let result = {
    feedback: 'Correct',
    attempts: 0,
    correctAttempts: 0
  };
  User.findById(req.user.id)
    .then(response => {
      let questions = response.questions;
      result.attempts = questions.head.value.attempts;
      result.correctAttempts = questions.head.value.correctAttempts;
      result.answer = questions.head.value.answer;
      if (response.questions.head.value.answer === req.body.answer) {
        questions = updatePosition(questions, questions.head.value.mValue + 1);
        result.attempts += 1;
        result.correctAttempts += 1;
      } else {
        questions = updatePosition(questions, 1);
        result.feedback = 'Incorrect';
        result.attempts += 1;
      }
      return User.findByIdAndUpdate(req.user.id, { $set: { questions } } );
    })
    .then(() => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
