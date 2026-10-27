import { HttpError } from '../utils/HttpError.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'API endpoint not found.'));
}

// Every error leaves the API as { message } – the shape the React app already reads.
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}
