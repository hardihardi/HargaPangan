import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

/**
 * Middleware generic untuk memvalidasi body/query/params menggunakan Zod.
 */
export function validateRequest(schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  };
}