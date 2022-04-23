# RumbleJS

Reactive Storage wrapped around either localStorage or sessionStorage, in the browser. you chooose which engine fits your needs.

It works like this:

```
const rls = RumbleJSStorage(localStorage);

rls.onRead("user", (event) => {
    console.log("User lu", event.value);
});

rls.onWrite("user", (event) => {
    console.log(event.previous, event.value);
});

rls.onRemove("user", (event) => {
    console.log("User profile removed. Need to signin again");
});

rls.onClear(() => {
    console.log("Storage has been cleared");
});

rls.setItem("user", "Paul Logan");
rls.getItem("user");
```

How it works: 

*RumbleJS* encapsulates either `localStorage` or `sessionStorage` to provide the same functionality as `localStorage` or `sessionStorage`, but is able to react to changes applied to the keys stored by it, on demand. Events are passed through the sender associated with the document, to allow function calls without latency or __promise__.


## Available functions and attributes

### readonly length: number
    Returns the total number of keys available in the storage


### clear(): void
    Clears the storage, and triggers the `clear` event. Interceptable with `onClear`.


### getItem(key: string): string | null


### getString(key: string): string | null


### getObject(key: string): any | null

    
### getNumber(key: string): number | null


### getBoolean(key: string): boolean


### getMatches(pattern: string | RegExp): { key: string, value: string | null }[]


### getNonNullMatches(pattern: string | RegExp): { key: string, value: string }[]


### key(index: number): string | null


### removeItem(key: string): void


### setItem(key: string, value: string): void


### on(params: SubscribeParams): Subscription


### onRead(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onWrite(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onRemove(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onClear(listener: SubscribeParams['listener']): Subscription


### on(params: SubscribeParams): Subscription;
