import { oak } from "./deps.ts";
import {FUNCTION_STATUS_HEADER_FIELD} from './constants.ts';

export function sendErrorResponse({
  err,
  ctx,
  callback,
  silent = false,
}: {
  err: Error | any;
  ctx: oak.Context | null;
  callback?: Function;
  silent?: boolean;
}) {
  if (!silent) {
    console.error(err?.stack ?? err);
  }

  if (ctx) {
    ctx.response.headers.set(FUNCTION_STATUS_HEADER_FIELD, "error");
    ctx.response.body = (err?.message ?? err) + "";
  }
  if (callback) {
    callback();
  }
}

/**
 * Logs an error message and sends back an error response to the incoming
 * request.
 * @param err Error to be logged and sent.
 * @param res Express response object.
 * @param callback A function to be called synchronously.
 */
export function sendCrashResponse({
  err,
  ctx,
  callback,
  silent = false,
}: {
  err: Error | any;
  ctx: oak.Context | null;
  callback?: Function;
  silent?: boolean;
}) {
  if (!silent) {
    console.error(err?.stack ?? err);
  }

  if (ctx) {
    ctx.response.headers.set(FUNCTION_STATUS_HEADER_FIELD, "crash");
    ctx.response.body = (err?.message ?? err) + "";
  }
  if (callback) {
    callback();
  }
}
