# RumbleJS

Reactive Storage wrapped around either localStorage or sessionStorage, in the browser. you chooose which engine fits your needs.

It works like this:

```javascript 
import SetupStorage from "rumblejs";

const rls = SetupStorage(localStorage);

const readSubscriber = rls.onRead("user", (event) => {
    console.log("User readed", event.value);
});

const writeSubscriber = rls.onWrite("user", (event) => {
    console.log(event.previous, event.value);
});

const removeSubscriber = rls.onRemove("user", (event) => {
    console.log("User removed. Need to signin again");
});

const clearSubscriber = rls.onClear(() => {
    console.log("Storage has been cleared");
});

rls.setItem("user", "Paul Logan");
rls.getItem("user");
rls.removeItem("user");

readSubscriber.cancel();
writeSubscriber.cancel();
removeSubscriber.cancel();
clearSubscriber.cancel();
/// same for other subscribers

// new feature: listen read/write on any key using '*'
const writeAnySubscriber = rls.onWrite('*',function(event){console.log('hello', event)})

// new feature: execute subscribers sync. default is async by `document.dispatchEvent`
rls.on({
    event:'get',
    key:'ok',
    listener(detail){console.log(detail)},
    sync: true,
})

```

How it works: 

*RumbleJS* encapsulates either `localStorage` or `sessionStorage` to provide the same functionality as `localStorage` or `sessionStorage`, but is able to react to changes applied to the keys stored by it, on demand. Events are passed through the sender associated with the document, to allow function calls without latency or __promise__.


## Available functions and attributes

### readonly length: number
Returns the total number of keys available in the storage


### clear(): void
Clears the storage, and triggers the `clear` event. Interceptable with `onClear`.


### getItem(key: string): string | null
Returns the current value associated with the given key, or null if the given key does not exist

### getString(key: string): string | null
Returns the current value associated with the given key, or null if the given key does not exist

### getObject(key: string): any | null
Returns the current value associated with the given key with automatic conversion to Javascript Object with `JSON.parse`, or null if the given key does not exist
    
### getNumber(key: string): number | null
Returns the current value associated with the given key with automatic parsing to number with `parseFloat`, or null if the given key does not exist

### getBoolean(key: string): boolean
Returns the current value associated with the given key with automatic parsing to boolean by checking if the value is equal to `true` or `1`, or false if the given key does not exist


### getMatches(pattern: string | RegExp): { key: string, value: string | null }[]
Returns every key value pair where the key match the given pattern. if each key-pair, the value might be null


### getNonNullMatches(pattern: string | RegExp): { key: string, value: string }[]
Returns every key value pair where the key match the given pattern. if each key-pair, but skip keys with null values.

### key(index: number): string | null
Return the key at the specified index

### removeItem(key: string): void
Remove the specified key from the storage.

### setItem(key: string, value: string): void
Append the given key value to storage.

### onRead(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onWrite(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onRemove(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription


### onClear(listener: SubscribeParams['listener']): Subscription


### on(params: SubscribeParams): Subscription;
