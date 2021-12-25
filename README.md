# Async JS (Event loop, Callbacks, Promises, and async await)

- [Async JS (Event loop, Callbacks, Promises, and async await)](#async-js-event-loop-callbacks-promises-and-async-await)
  - [Synchronous -> asynchronous](#synchronous---asynchronous)
  - [Event loops](#event-loops)
    - [Stack and Queues](#stack-and-queues)
  - [Callback functions](#callback-functions)
    - [Callback Hell](#callback-hell)
  - [Promises](#promises)
    - [Consuming promises](#consuming-promises)
    - [Error handling](#error-handling)
  - [Async/await](#asyncawait)
    - [Catching errors](#catching-errors)
  - [References](#references)

## Synchronous -> asynchronous

Javascript is a single-threaded langauge with a synchronous execution model, which means it processes one operation after another.

Since API calls can take an indeterminate amount of time, depending on factors such as network speed, size of data, etc. if API calls were synchronous, the browser will be processing that operation only, and other user input such as scrolling and clicking a button will be blocked, which is the concept of blocking.

To prevent blocking, the browser uses Web APIs that JS uses to run asynchronous code, in other words, it can run code in parallel instead of sequentially. This allows users to continue using a website normally while the asynchronous operations are processed in the background.

To understand Async JS, you need to learn about the event loop, the OG way of writing async code with callbacks, the updated way with promises, and the modern practice of async/await.

## Event loops

JS runs code line by line, take this code for example

```js
const first = () => console.log(1);
const second = () => console.log(2);
const third = () => console.log(3);

first();
second();
third();
```

The output will then be based on the order of the functions, as follows:

```txt
1
2
3
```

Now consider when asynchronous web API is used, we can simulate asynchronous requests with the `setTimeout()` function.

```js
const first = () => console.log(1);
const second = () => {
  // setTimeout is asynchronous
  setTimeout(() => {
    console.log(2);
  }, 0);
};
const third = () => console.log(3);

first();
second();
third();
```

With asynchronous requests, the function with timeout is printed last.

```txt
1
3
2
```

To explain this phenomonen, you need to understand the event loop.

Since JS can execute one statement at a time, it utilizes the event loop to determine when to execite which statement. To handle this, it uses the concepts of stacks and queues.

### Stack and Queues

The stack holds the state of which function is currently running. If you forgot your intro to algorithms class, the stack is an array with "Last In First Out" LIFO properties. Using stacks, JS runs the current frame in the stack, remove it, and move on to the next one.

In our synchronous code, this is how the browser handles the execution

- Add `first()` to the stack, run it, remove `first()` from the stack
- Add `second()` to the stack, run it, remove `second()` from the stack
- Add `third()` to the stack, run it, remove `third()` from the stack

With the `setTimeout` included, this are a little different

- Add `first()` to the stack, run it, remove `first()` from the stack
- Add `second()` to the stack, run it
  - Add `setTimeout()` to the stack, run the `setTimeout()` Web API which starts a timer, add the func to the queue
  - remove `setTimeout()` from the stack
- remove `second()` from the stack
- Add `third()` to the stack, run it, remove `third()` from the stack
- Event loop checks the queue for pending messages, it sees the function from `setTimeout()`, adds it to the stack, runs it, and removes it.

This is why the `second()` function logs after the `third()`. The queue acts as a waiting area for functions. Once the stack is empty, the event loop checks for the queue for any waiting messages, starting from the oldest (FIFO) property. Once it finds one, it adds it to the stack, and executes the function.

The event loop sends over asynchronous code to the queue, and runs other synchronous code in the stack, waits for the code to be done on the queue, and then only runs the rest of the code.

> There's also another queue called job/microtask queue that handles promises. Microtasks are handled at higher priority than macrotasks like setTimeout.

For example, the code below

```js
console.log("Synchronous 1");

setTimeout(() => {
  console.log("Timeout 2");
}, 0);

Promise.resolve().then(() => console.log("Promise 3"));

console.log("Synchronous 4");
```

will output

```txt
Synchronous 1
Synchronous 4
Promise 3
Timeout 2
```

Understand more about event loops 👇

[Jake Archibald: In The Loop - JSConf.Asia - YouTube](https://www.youtube.com/watch?v=cCOL7MC4Pl0)

## Callback functions

To understand why callback functions exist, let's go back to the previous example.

Say you want the third function to run after the timeout. You may want this to happen because the third function may be dependent on the second function, and the timeout is an API call that provides necessary data for the third function.

> Ex: Second function is api call to get user_id, third function is another api call that uses user_id to get statsitics.

The task is to get the third function to delay execution after the asynchronous action in the second function is completed, here's how you can do that

```js
const first = () => console.log(1);
const second = (callback) => {
  setTimeout(() => {
    console.log(2);

    // execute the callback function
    callback();
  }, 0);
};
const third = () => console.log(3);

first();
second(third);
```

Now, the output will be in order

```text
1
2
3
```

> The key takeaway is callbacks allow you to be informed of when an async task has completed, and it can handle the success or failure of that task

This simple example was not an issue for callbacks, but what happens when you start nesting callbacks? You have something called callback hell.

### Callback Hell

Callback functions ensure delayed execution of a function until another one completes and returns with the data. Due to the nested nature of callbacks (the next function being dependent on the previous),you get a lot of consecutive async requests that rely on each other.

Here's an example of that mess.

```js
function pyramidOfDoom() {
  setTimeout(() => {
    console.log(1);
    setTimeout(() => {
      console.log(2);
      setTimeout(() => {
        console.log(3);
      }, 500);
    }, 2000);
  }, 1000);
}
```

The solution to callback hell? **Promises**.

## Promises

A promise represents the completion of an asynchronous function. It is an object that might return a value in the future. Just like in real life, when you make a promise and commit to something, and that promise might be fulfilled in the future.

Promises accomplishes the same goal as callbacks, but with additional features and a cleaner syntax.

This is how you create a promise in JS

```js
const promise = new Promise((resolve, reject) => {});
```

Promises must be initialized in a function, and it has `resolve` and `reject` parameters, which handles the success and failure of an operation, respectively.

There are three possible stats to a promise:

A promise has 3 possible states:

- **Pending** - Initial state before being resolved or rejected
- **Fulfilled** - Successful operation
- **Rejected** - Failed operation

With promises, you not only want to fulfill (resolve) with values, you also want to access those values. You can do that my "consuming" the promises

### Consuming promises

Promises have a method called `then` that runs after a promise reaches resolve.

```js
Promise.resolve("API call success!").then((res) => {
  console.log(res);
});
```

```text
API call success
```

So far we've only looked at how to create a promise and then consuming it. It's time to chain operations, which is the feature of promises that eliminates nested callbacks.

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Resolving an async request!"), 2000;
  });
});

promise
  .then((firstResponse) => {
    return firstResponse + " and chaining!";
  })
  .then((secondResponse) => {
    console.log(secondResponse);
  });
```

```text
Resolving an async request! and chaining!
```

### Error handling

So far we've only been resolving promises, but often enough async requests have errors. A promise should always be able to handle both cases.

Below we simulate getting users from an API call, and we have an `onSuccess` variable where the timeout will fulfill our promise if it's `true`, and reject it if it's `false`

```js
function getUsers(onSuccess) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (onSuccess) {
        resolve([
          { id: 1, name: "Jerry" },
          { id: 2, name: "Elaine" },
          { id: 3, name: "George" },
        ]);
      } else {
        reject("Failed to fetch data!");
      }
    }, 1000);
  });
}

getUsers(false)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
```

```text
Failed to fetch data!
```

[More on Promise in MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Now it's time for async/await, the new fashionable way of working with promises.

## Async/await

async/await is syntatic suger wrapped around promises. The `async` function allows you to handle async code that appears synchronous.

> syntactic sugar is syntax within a programming language that is designed to make things easier to read or to express

Let's start with the `async` keyword.

```js
async function f() {
  return 1;
}
```

Adding the async keyword the the function turns it into a function that always returns a promise.

This means the above code is essntially the same as

```js
async function f() {
  return Promise.resolve(1);
}
```

Now for the `await` keyword.

The `await` keyword tells JS to wait until the promise settles and returns its result.

Here's an example of async and await in action

```js
async function f() {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000);
  });

  const result = await promise; // waits until promise is resolve
  console.log(result);
}
```

What the `await` keyword is doing is is literally suspending the function execution until the promise is settled, then resumes with the promise result. Note this doesn't cost any CPU resources, as the JS engine can do other jobs in the meantime: execute other scripts, handle events, etc.

It's basically just an elegant way of getting the promise result instead of using `promise.then()`. And it's easy to read and write.

### Catching errors

Instead of using the `catch` method with `then`, you can use the `try`/`catch` pattern to handle exceptions like below.

```js
const getUser2 = async (user) => {
  try {
    const response = await fetch(`https://api.github.com/users/${user}`);
    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
```

Modern asynchronous JS code is handled with `async`/`await`, but it's still important to know how promises work as they are capabale of additional features such as `Promise.all()`

## References

- [Understanding the Event Loop, Callbacks, Promises, and Async/Await in JavaScript | DigitalOcean](https://www.digitalocean.com/community/tutorials/understanding-the-event-loop-callbacks-promises-and-async-await-in-javascript)
- [JavaScript Promises In 10 Minutes](https://www.youtube.com/watch?v=DHvZLI7Db8E)
- [JavaScript Async Await](https://www.youtube.com/watch?v=V_Kr9OSfDeU)
- [The Async Await Episode I Promised](https://www.youtube.com/watch?v=vn3tm0quoqE)
- [Async Javascript Tutorial For Beginners (Callbacks, Promises, Async Await)](https://www.youtube.com/watch?v=_8gHHBlbziw)
