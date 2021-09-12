// Some import statement

class Route {
  // This is used only to validate the method names
}

class GetRoute extends Route {}
class AllRoute extends Route {}

// There is NO index.js concept in Deno anymore...


// I think grouping routes that extends from 
export class MyGetRoute extends GetRoute { // Use types, not names! get_blah is awkward: both NOT JS norm to use _ and handwavy feeling of method enforcement
  main() { // GET /a or GET /a/

  }

  functionOne() { // GET /a/functionOne

  }
}

export class MyAllRoute extends AllRoute {

}

// Problem with this approach: NO STATIC TypeScript checking... Things explode at runtime.

/*
Idea: we will ask the user to explicitly register a function, like

// Since registerGet would have a type signature, the signature check could be performed prior to running even in the IDE
register("GET", {
  default(ctx) {

  },
  methodA(ctx) {

  }
  // ...
});

We will allow them to use directory structure. We will store where they registered the function (import.meta.url)
We would store them in a global symboled location so we can retrieve each registered path.

The user would just need to run

deno run -A https://cloud.google.com/deno_cloud_functions/run.ts --root=./routes.
It also simplifies routing - routing is flat registering, no nesting necessary.

We would intercept cloudevents.
 */
