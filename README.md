# Deno Functions Framework

> **WARNING: WIP**

A lightweight, open source FaaS (Function as a Service) framework for Deno.

The framework allows you to go from:

```ts
import type { Context } from "https://deno.land/x/oak@v9.0.0/mod.ts";
export function hello(ctx: Context) {
  ctx.response.body = "Hello, World!";
}
```

To:

```sh
curl http://my-url
# Output: Hello, World!
```

All without needing to worry about writing an HTTP server or complicated request handling logic.

## Features

- Spin up a local development server for quick testing
- Invoke a function in response to a request
- ~~Automatically unmarshal events conforming to the
  [CloudEvents](https://cloudevents.io/) spec~~
- Portable between serverless platforms

## Installation

There's no installation step for this library. It's Deno.

## Quickstart

> Assumes you have [Deno installed](https://deno.land/#installation)

1. Create an `test/hello.ts` file with the following contents:

    ```ts
    import type { Context } from "https://deno.land/x/oak@v9.0.0/mod.ts";

    export function hello(ctx: Context) {
      ctx.response.body = "Hello, World!";
    }
    ```

1. Start the local server:

    ```sh
    deno run -A ./run.ts --target=hello --source=test/hello.ts
    ```

1. Send requests to this function using `curl` from another terminal window:

    ```sh
    curl localhost:8080
    Output: Hello, World!
    ```

## Run in Container

__TODO: FIXME__

You can also run this server in a container:

```sh
docker build -t app . && docker run -it --init -p 8080:8080 app
```

## Deploy to Cloud Run

```sh
gcloud beta run deploy deno-ff \
--source . \
--allow-unauthenticated
```

## Publish

TODO: Publish this to a separate repo:

https://dev.to/craigmorten/how-to-publish-deno-modules-2cg6