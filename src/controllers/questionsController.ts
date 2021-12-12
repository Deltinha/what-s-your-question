import { NextFunction, Request, Response } from 'express';

import * as questionsService from '../services/questionsService';
import * as usersService from '../services/usersService';

export async function postQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { question, student, tags } = req.body;
  const _class = req.body.class;

  try {
    if (!question || !student || !tags || !_class) {
      throw new SyntaxError('missing property in request`s body');
    }

    const questionId = await questionsService.postQuestion({
      question,
      student,
      tags,
      class: _class,
    });

    return res.send({ id: questionId }).status(200);
  } catch (error) {
    if (error.name === 'SyntaxError') {
      return res.status(400).send(error.message);
    }
    return next(error);
  }
}

interface Answer {
  answer: string;
}

export async function postAnswer(req: Request, res: Response) {
  const auth = req.headers.authorization;
  const id = Number(req.params.id);

  if (!id) return res.sendStatus(400);
  if (!auth) return res.sendStatus(401);

  const user = usersService.userExists(auth);
  if (!user) return res.sendStatus(401);

  const { answer }: Answer = req.body;

  const result = await questionsService.answerQuestion({
    text: answer,
    questionId: id,
    userId: 1,
  });
  if (!result) return res.sendStatus(400);

  return res.sendStatus(201);
}

export async function getUnansweredQuestions(req: Request, res: Response) {
  const questions = await questionsService.getUnansweredQuestions();
  res.send(questions).status(200);
}

export async function getQuestionById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.sendStatus(400);
  const question = await questionsService.getQuestionById(id);
  return res.send(question).status(200);
}
