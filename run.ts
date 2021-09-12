// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Functions framework entry point that configures and starts Node.js server
// that runs user's code on HTTP request.
// The following environment variables can be set to configure the framework:
//   - PORT - defines the port on which this server listens to all HTTP
//     requests.
//   - FUNCTION_TARGET - defines the name of the function within user's
//     node module to execute. If such a function is not defined,
//     then falls back to 'function' name.
//   - FUNCTION_SIGNATURE_TYPE - defines the type of the client function
//     signature:
//     - 'http' for function signature with HTTP request and HTTP
//     response arguments,
//     - 'event' for function signature with arguments
//     unmarshalled from an incoming request,
//     - 'cloudevent' for function signature with arguments
//     unmarshalled as CloudEvents from an incoming request.
import "https://deno.land/x/dotenv@v3.0.0/load.ts";
import { flags, path } from "./src/deps.ts";

const { resolve } = path;
import {getUserFunction, getServer} from './src/loaders/function/mod.ts';
// import {ErrorHandler} from './invoker';
import {SignatureType} from './src/constants.ts';

// Supported command-line flags
const FLAG = {
  PORT: 'port',
  TARGET: 'target',
  SIGNATURE_TYPE: 'signature-type', // dash
  SOURCE: 'source', // Has to be a filename instead of a directory name in Deno.
};

// Supported environment variables
const ENV = {
  PORT: 'PORT',
  TARGET: 'FUNCTION_TARGET',
  SIGNATURE_TYPE: 'FUNCTION_SIGNATURE_TYPE', // underscore
  SOURCE: 'FUNCTION_SOURCE',
};

enum DenoEnv {
  PRODUCTION = 'production',
}

const argv = flags.parse(Deno.args);

const CODE_LOCATION = resolve(
  argv[FLAG.SOURCE] || Deno.env.get(ENV.SOURCE) || 'mod.ts'
);
const PORT = argv[FLAG.PORT] || Deno.env.get(ENV.PORT) || '8080';
// TODO: "function" is not a valid export name
const TARGET = argv[FLAG.TARGET] || Deno.env.get(ENV.TARGET) || 'handler';

const SIGNATURE_TYPE_STRING =
  argv[FLAG.SIGNATURE_TYPE] || Deno.env.get(ENV.SIGNATURE_TYPE) || 'http';
const SIGNATURE_TYPE =
  SignatureType[
    SIGNATURE_TYPE_STRING.toUpperCase() as keyof typeof SignatureType
  ];
if (SIGNATURE_TYPE === undefined) {
  console.error(
    `Function signature type must be one of: ${Object.values(
      SignatureType
    ).join(', ')}.`
  );
  Deno.exit(1);
}

if (argv["h"] || argv["help"]) {
  console.error(
    `Example usage:
  functions-framework --target=helloWorld --port=8080
Documentation:
  https://github.com/GoogleCloudPlatform/functions-framework-nodejs`
  );
  Deno.exit(0);
}

getUserFunction(CODE_LOCATION, TARGET).then(userFunction => {
  console.log(userFunction);

  if (!userFunction) {
    console.error('Could not load the function, shutting down.');
    Deno.exit(1);
  }

  const SERVER = getServer(userFunction!, SIGNATURE_TYPE!);
  // TODO: currently no way to listen for Deno crashes
  // Similarly Oak does not support tracking if a request has headers sent or not.

  if (Deno.env.get("DENO_ENV") !== DenoEnv.PRODUCTION) {
    console.log('Serving function...');
    console.log(`Function: ${TARGET}`);
    console.log(`Signature type: ${SIGNATURE_TYPE}`);
    console.log(`URL: http://localhost:${PORT}/`);
  }
  SERVER.listen({ port: +PORT });
});
