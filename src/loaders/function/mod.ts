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

/**
 * This package contains the logic to load user's function.
 * @packageDocumentation
 */

import { nodeUrl } from '../../deps.ts';

const { pathToFileURL } = nodeUrl;

import {HandlerFunction, EventFunction, CloudEventFunction} from '../../interface.ts';
import {SignatureType} from '../../constants.ts';
import { registerHTTPHandler, registerEventHandler, registerCloudEventHandler } from "../../register.ts"

import { oak } from "../../deps.ts";

function registerFunctionRoutes(
  router: oak.Router,
  userFunction: HandlerFunction,
  functionSignatureType: SignatureType
)  {
  if (functionSignatureType === SignatureType.HTTP) {
    // Updates to path-to-regexp now prohibits /*
    registerHTTPHandler(router, "/(.*)", userFunction as oak.Middleware);
  } else if (functionSignatureType === SignatureType.EVENT) {
    registerEventHandler(router, "/(.*)", userFunction as EventFunction);
  } else {
    registerCloudEventHandler(router, "/(.*)", userFunction as CloudEventFunction);
  }
}

/**
 * Creates and configures an Express application and returns an HTTP server
 * which will run it.
 * @param userFunction User's function.
 * @param functionSignatureType Type of user's function signature.
 * @return HTTP server.
 */
export function getServer(
  userFunction: HandlerFunction,
  functionSignatureType: SignatureType
): oak.Application {
  // App to use for function executions.
  const app = new oak.Application({ proxy: true });

  // Router instance
  const router = new oak.Router();

  // Oak middleware
  router.use("/(favicon.ico|robots.txt)", (ctx) => {
    ctx.response.status = 404;
  });

  registerFunctionRoutes(router, userFunction, functionSignatureType);
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

/**
 * Returns user's function from function file.
 * Returns null if function can't be retrieved.
 * @return User's function or null.
 */
export async function getUserFunction(
  codeLocation: string,
  functionTarget: string
): Promise<HandlerFunction | null> {
  try {
    let functionModule;
    // Resolve module path to file:// URL. Required for windows support.
    const fpath = pathToFileURL(codeLocation);
    functionModule = await import(fpath.href);

    let userFunction = functionTarget
      .split('.')
      .reduce((code, functionTargetPart) => {
        if (typeof code === 'undefined') {
          return undefined;
        } else {
          return code[functionTargetPart];
        }
      }, functionModule);

    // TODO: do we want 'handler' fallback?
    if (typeof userFunction === 'undefined') {
      // TODO: default changed from 'function' to 'handler'
      if (({}).hasOwnProperty.call(functionModule, "handler")) {
        userFunction = functionModule["handler"];
      } else {
        console.error(
          `Function '${functionTarget}' is not defined in the provided ` +
            'module.\nDid you specify the correct target function to execute?'
        );
        return null;
      }
    }

    if (typeof userFunction !== 'function') {
      console.error(
        `'${functionTarget}' needs to be of type function. Got: ` +
          `${typeof userFunction}`
      );
      return null;
    }

    return userFunction as HandlerFunction;
  } catch (ex) {
    let additionalHint: string;
    // TODO: this should be done based on ex.code rather than string matching.
    if (ex.stack && ex.stack.includes('Cannot find module')) {
      additionalHint =
        'Did you list all required modules in the package.json ' +
        'dependencies?\n';
    } else {
      additionalHint = 'Is there a syntax error in your code?\n';
    }
    console.error(
      `Provided module can't be loaded.\n${additionalHint}` +
        `Detailed stack trace: ${ex.stack}`
    );
    return null;
  }
}
 