import { Request } from "express";

export type TypedRequest<Params = any, Body = any, Query = any> = Request<
  Params,
  any,
  Body,
  Query
>;
