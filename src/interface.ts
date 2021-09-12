import { oak } from "./deps.ts";

/**
 * The CloudEvents v1.0 context object for the event.
 *
 * @link https://github.com/cloudevents/spec/blob/master/spec.md#context-attributes
 */
export interface CloudEventsContext {
  /**
   * Type of occurrence which has happened.
   */
  type?: string;
  /**
   * The version of the CloudEvents specification which the event uses.
   */
  specversion?: string;
  /**
   * The event producer.
   */
  source?: string;
  /**
   * ID of the event.
   */
  id?: string;
  /**
   * Timestamp of when the event happened.
   */
  time?: string;
  /**
   * Describes the subject of the event in the context of the event producer.
   */
  subject?: string;
  /**
   * A link to the schema that the event data adheres to.
   */
  dataschema?: string;
  /**
   * Content type of the event data.
   */
  datacontenttype?: string;
  /**
   * The event data.
   */
  data?:
    | Record<string, unknown | string | number | boolean>
    | string
    | number
    | boolean
    | null
    | unknown;
}

export interface CloudEventFunction {
  (cloudevent: CloudEventsContext): any;
}

/**
 * The Cloud Functions context object for the event.
 *
 * @link https://cloud.google.com/functions/docs/writing/background#function_parameters
 */
 export interface CloudFunctionsContext {
  /**
   * A unique ID for the event. For example: "70172329041928".
   */
  eventId?: string;
  /**
   * The date/time this event was created. For example: "2018-04-09T07:56:12.975Z"
   * This will be formatted as ISO 8601.
   */
  timestamp?: string;
  /**
   * The type of the event. For example: "google.pubsub.topic.publish".
   */
  eventType?: string;
  /**
   * The resource that emitted the event.
   */
  resource?: string | object;
}

export type Context = CloudFunctionsContext | CloudEventsContext;

export interface EventFunction {
  (data: {}, context: Context): any;
}

export type HandlerFunction =
  | oak.Middleware
  | EventFunction
  | CloudEventFunction;