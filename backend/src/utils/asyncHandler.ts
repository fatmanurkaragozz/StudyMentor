import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not forward rejected promises from async handlers to the
// error middleware on its own - every async route handler must be wrapped.
// Generic over Req so controllers can use typed Request<Params, ...> signatures
// (e.g. Request<{ id: string }>) without losing type-checking here.
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}
