import { CloudEventFunction, CloudEventsContext, EventFunction, Context } from "./interface.ts";
import { oak } from "./deps.ts";
import { isBinaryCloudEvent, getBinaryCloudEventContext } from "./cloudevents.ts"
import { sendErrorResponse, sendCrashResponse } from "./logger.ts";
import { isRawPubSubRequestBody, marshalPubSubRequestBody } from "./pubsub.ts"

function wrapEventFunction(handler: EventFunction): oak.Middleware {
  return async (ctx) => {
    let data: {};
    let context: Context = {};
    try {
      const eventBody = ctx.request.body({
        contentTypes: {
          json: ['application/cloudevents+json']
        }
      }) as oak.Body;
      if (isBinaryCloudEvent(ctx.request.headers)) {
        // Support CloudEvents in binary content mode, with data being the whole
        // request body and context attributes retrieved from request headers.
        data = await eventBody.value;
        context = getBinaryCloudEventContext(ctx.request.headers);
      } else {
        if (eventBody.type !== "json") {
          throw new Error("Cannot decode event body");
        }

        let event = await eventBody.value;
        if (isRawPubSubRequestBody(event)) {
          event = marshalPubSubRequestBody(event, ctx.request.url.pathname);
        }

        data = event.data;
        if (event.context === undefined) {
          // Support legacy events and CloudEvents in structured content mode, with
          // context properties represented as event top-level properties.
          // Context is everything but data.
          context = event;
          if (context.hasOwnProperty('data')) {
            // @ts-ignore
            delete context.data;
          }
        } else {
          context = event.context;
        }
      }
    } catch (err) {
      // TODO: status code?
      sendErrorResponse({ err, ctx });
      return;
    }

    let result;
    try {
      result = await handler(data, context);
    } catch (err) {
      sendCrashResponse({ err, ctx });
      return;
    }

    if (result === undefined || result === null) {
      ctx.response.status = 204;
    } else {
      try {
        ctx.response.body = result;
      } catch (sendErr) {
        console.error('Error serializing return value: ' + sendErr.toString());
        ctx.response.status = 204;
      }
    }
  };
}

// No longer support callbacks.
// Callbacks are explicitly phased out in Deno
function wrapCloudEventFunction(handler: CloudEventFunction): oak.Middleware {
  return async (ctx) => {
    let cloudevent: CloudEventsContext;
    try {
      const headers = ctx.request.headers;
      // TODO: limit max parse body size. Currently 
      const body = ctx.request.body({
        contentTypes: {
          json: ['application/cloudevents+json']
        }
      }) as oak.Body;
      if (isBinaryCloudEvent(headers)) {
        cloudevent = getBinaryCloudEventContext(headers);
        cloudevent.data = await body.value;
      } else if (body.type === "json") {
        cloudevent = (await body.value) as CloudEventsContext;
      } else {
        throw new Error("Cannot decode cloud event body");
      }
    } catch (err) {
      // TODO: status code?
      sendErrorResponse({ err, ctx });
      return;
    }

    let result;
    try {
      result = await handler(cloudevent);
    } catch (err) {
      sendCrashResponse({ err, ctx });
      return;
    }

    if (result === undefined || result === null) {
      ctx.response.status = 204;
    } else {
      try {
        ctx.response.body = result;
      } catch (sendErr) {
        console.error('Error serializing return value: ' + sendErr.toString());
        ctx.response.status = 204;
      }
    }
  }
}

export function registerHTTPHandler(router: oak.Router, path: string, handler: oak.Middleware) {
  // We are not going to parse the body for the user here.
  // Let the user decide what to do
  router.all(path, handler);
}

export function registerEventHandler(router: oak.Router, path: string, handler: EventFunction) {
  const middleware = wrapEventFunction(handler);
  router.post(path, middleware);
}

export function registerCloudEventHandler(router: oak.Router, path: string, handler: CloudEventFunction) {
  const middleware = wrapCloudEventFunction(handler);
  router.post(path, middleware);
}