export function hello(ctx) {
  ctx.response.body = "Hello!";
}

export function helloCloudEvent(cloudEvent) {
  console.log(cloudEvent);
  return "helloCloudEvent";
}

export function helloCloudEventBinary(cloudEvent) {
  console.log(cloudEvent);
  return "helloCloudEventBinary";
}