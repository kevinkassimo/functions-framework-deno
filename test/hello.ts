import type { Context } from "https://deno.land/x/oak@v9.0.0/mod.ts";

export function hello(ctx: Context) {
  ctx.response.body = "Hello, World!";
}

export function helloCloudEvent(cloudEvent: any) {
  console.log(cloudEvent);
  return "helloCloudEvent";
}

export function helloCloudEventBinary(cloudEvent: any) {
  console.log(cloudEvent);
  return "helloCloudEventBinary";
}