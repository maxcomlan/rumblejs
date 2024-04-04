export const StorageTypes = {
    string: "string", 
    object: "object" , 
    number: "number",
    boolean: "boolean"
}

export declare namespace Rumble {
    export type Types =  keyof typeof StorageTypes;
    export type Event = "set" | "get" | "remove" | "clear";
    export type EventListener = (details: Reaction) => any;
    export interface Reaction {
        event: Event,
        key?: string;
        value?: any;
        [key: string]: any;
    }
    export type Subscription = {
        id: string;
        event: Event;
        key?: string;
        listener: EventListener;
        cancel: () => any
    }
    type SubscribeParams = {
        event: Event,
        listener: EventListener,
        key?: string,
        sync?: boolean,
    }

    interface ReactiveStorage {
        $__block: Storage;
        /** Returns the number of key/value pairs. */
        readonly length: number;
        /**
         * Removes all key/value pairs, if there are any.
         *
         * Dispatches a storage event on Window objects holding an equivalent Storage object.
         */
        clear(): void;

        /** Returns the current value associated with the given key, or null if the given key does not exist. */
        getItem(key: string): string | null;

        /** Returns the current value associated with the given key, or null if the given key does not exist. */
        getString(key: string): string | null;

        /** Returns the current object value associated with the given key, or null if the given key does not exist. */
        getObject(key: string): any | null;

        /** Returns the current number value associated with the given key, or null if the given key does not exist. */
        getNumber(key: string): number | null;

        /** Returns the current boolean value associated with the given key, or null if the given key does not exist. */
        getBoolean(key: string): boolean;

        /** Returns the keys in the block storage that match the given pattern*/
        getMatches(pattern: string | RegExp): { key: string, value: string | null }[];

        /** Returns the keys in the block storage that match the given pattern*/
        getNonNullMatches(pattern: string | RegExp): { key: string, value: string }[];

        key(index: number): string | null;
        /**
         * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
         *
         * Dispatches a storage event on Window objects holding an equivalent Storage object.
         */
        removeItem(key: string): void;

        setDefault(key: string, value: string, type?: StorageTypes): void;
        /**
         * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
         *
         * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
         *
         * Dispatches a storage event on Window objects holding an equivalent Storage object.
         */
        setItem(key: string, value: string): void;
        /**
         * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
         *
         * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
         *
         * Dispatches a storage event on Window objects holding an equivalent Storage object.
         */
        setObject(key: string, value: any): void;
        /**
        * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
        *
        * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
        *
        * Dispatches a storage event on Window objects holding an equivalent Storage object.
        */
        setBoolean(key: string, value: boolean): void;
        /**
         * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
         *
         * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
         *
         * Dispatches a storage event on Window objects holding an equivalent Storage object.
         */
        setNumber(key: string, value: number): void;
        /**
        * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
        *
        * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
        *
        * Dispatches a storage event on Window objects holding an equivalent Storage object.
        */
        setString(key: string, value: string): void;

        /**
         * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
         */
        on(params: SubscribeParams): Subscription;
        /**
         * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
         */
        onRead(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription;
        /**
          * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
          */
        onWrite(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription;
        /**
         * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
         */
        onRemove(key: SubscribeParams['key'], listener: SubscribeParams['listener']): Subscription;
        /**
        * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
        */
        onClear(listener: SubscribeParams['listener']): Subscription;
        /**
         * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
         */
        on(params: SubscribeParams): Subscription;
        [key: string]: any;
    }

}


export function cast(value: string | null | undefined, type: Rumble.Types = "string") {
    switch(type) {
        case "string": {
            return value;
        }
        case "boolean": {
            if (!value) {
                return false;
            }
            try {
                let parsed = ["true", '1'].includes(value.toLowerCase());
                return parsed;
            } catch (error) {
                return false;
            }
        }
        case "object": {
            if (!value) {
                return undefined;
            }
            try {
                let parsed = JSON.parse(value);
                return parsed;
            } catch (error) {
                return undefined;
            }
        }
        case "number": {
            if (!value) {
                return undefined;
            }
            try {
                let parsed = parseFloat(value);
                return parsed;
            } catch (error) {
                return undefined;
            }
        }
        default: 
            return undefined;
    }
}

const allWatchers = {
  get: {},
  set: {},
  remove: {},
  clear: {},
};

const Cache = {};

function SetupStorage(block: Storage): Rumble.ReactiveStorage {
    let reactiveWrapper = {
        $__id: crypto.randomUUID(),
        $__block: block,
        $__buildEvent(ev: Rumble.Event) {
            return `storage.reactive.${this.$__id}/${ev}`;
        },
        $__dispatch(ev: Rumble.Event, details: any) {
            this.$__dispatchSync(ev, details);
            
            document.dispatchEvent(
                new CustomEvent<Rumble.Reaction>(
                    this.$__buildEvent(ev),
                    {
                        detail: {
                            event: ev as any,
                            ...details
                        }, cancelable: true
                    }
                )
            );
        },
        $__dispatchSync(ev: Rumble.Event, details: any) {
            const watchers = (allWatchers[ev]['*'] || []).concat( allWatchers[ev][details.key] || []);
            if (watchers.length > 0) {
                watchers.forEach(fn => {
                    fn(details);
                });
            }
        },

        get length() {
            return block.length;
        },

        key(idx: number) {
            return block.key(idx);
        },

        getItem(key: string) {
            let reflect;
            if (key in Cache)
                reflect = Cache[key];
            else{
                reflect = block.getItem(key);
                Cache[key] = reflect;
            }
            if (reflect) {
                this.$__dispatch("get",
                    {
                        key: key,
                        value: reflect
                    }
                );
            };
            return reflect;
        },

        getString(key: string) {
            let item;
            if (key in Cache)
                item = Cache[key];
            else{
                item = block.getItem(key);
                Cache[key] = item;
            }
            return item;
        },

        getObject(key: string) {
            let item;
            if (key in Cache)
                item = Cache[key];
            else{
                item = cast(block.getItem(key), "object");
                Cache[key] = item;
            }
            return item;
        },

        getNumber(key: string) {
            let item;
            if (key in Cache)
                item = Cache[key];
            else{
                item = cast(block.getItem(key), "number");
                Cache[key] = item;
            }
            return item;
        },

        getBoolean(key: string) {
            let item;
            if (key in Cache)
                item = Cache[key];
            else{
                item = cast(block.getItem(key), "boolean");
                Cache[key] = item;
            }
            return item;
        },

        getMatches(pattern: string | RegExp) {
            let matches = [];
            for (let i = 0; i < this.length; i++) {
                let key = this.key(i);
                if (key && key.match(pattern)) {
                    matches.push({ key, value: this.getItem(key) })
                }
            }
            return matches;
        },

        getNonNullMatches(pattern: string | RegExp) {
            let matches = [];
            for (let i = 0; i < this.length; i++) {
                let key = this.key(i);
                if (key && key.match(pattern)) {
                    let value = this.getItem(key);
                    if (value) {
                        matches.push({ key, value });
                    }
                }
            }
            return matches;
        },

        setDefault(key: string, value: string, type?: StorageTypes){
            const item = block.getItem(key);
            if(null === item){
                if(!type)
                    this.setItem(key, value)
                else{
                    const method = type.charAt(0).toUpperCase() + type.slice(1);
                    this['set'+method](key, value)
                }
            }
        },

        setItem(key: string, value: string) {
            let previous = this.getItem(key);
            block.setItem(key, value);
            Cache[key] = value;
            this.$__dispatch(
                "set",
                {
                    key: key,
                    value,
                    previous
                }
            );
        },

        setObject(key: string, value: any) {
            let previous = this.getItem(key);
            block.setItem(key, JSON.stringify(value));
            Cache[key] = value;
            this.$__dispatch(
                "set",
                {
                    key: key,
                    value,
                    previous
                }
            );
        },

        setNumber(key: string, value: number) {
            let previous = this.getItem(key);
            block.setItem(key, value + '');
            Cache[key] = value;
            this.$__dispatch(
                "set",
                {
                    key: key,
                    value,
                    previous
                }
            );
        },

        setBoolean(key: string, value: boolean) {
            let previous = this.getItem(key);
            block.setItem(key, value+"");
            Cache[key] = value;
            this.$__dispatch(
                "set",
                {
                    key: key,
                    value,
                    previous
                }
            );
        },

        setString(key: string, value: string) {
            let previous = this.getItem(key);
            block.setItem(key, value);
            Cache[key] = value;
            this.$__dispatch(
                "set",
                {
                    key: key,
                    value,
                    previous
                }
            );
        },

        removeItem(key: string) {
            let value = this.getItem(key);
            block.removeItem(key);
            delete Cache[key];
            this.$__dispatch(
                "remove",
                {
                    key: key,
                    value
                }
            );
        },

        clear() {
            block.clear();
            Cache = {};
            this.$__dispatch(
                "clear",
                {
                    key: "",
                    value: ""
                }
            );
        },

        on(params: Rumble.SubscribeParams) {

            if(params.sync){
                const watchers = allWatchers[params.event];
                if (!watchers[params.key]) {
                    watchers[params.key] = [];
                }

                const index = watchers[params.key].push(params.listener) -1;
                let subscription: Rumble.Subscription = {
                    id: crypto.randomUUID(),
                    key: params.key,
                    event: params.event,
                    listener: params.listener,
                    cancel() {
                        return allWatchers[params.event][params.key].splice(index, 1);
                    }
                };
                return subscription;
            }

            
            let rx = this;
            let documentListener = (ev: CustomEvent<Rumble.Reaction>) => {
                if (( params.key === '*' || ev.detail.key === params.key ) && ev.detail.event === params.event) {
                    params.listener(ev.detail);
                }
            }
            document.addEventListener(this.$__buildEvent(params.event) as any, documentListener);
            let subscription: Rumble.Subscription = {
                id: crypto.randomUUID(),
                key: params.key,
                event: params.event,
                listener: params.listener,
                cancel() {
                    return document.removeEventListener(rx.$__buildEvent(params.event) as any, documentListener);
                }
            };
            return subscription;
        },

        onRead(key: Rumble.SubscribeParams['key'], listener: Rumble.SubscribeParams['listener']) {
            return this.on({
                event: "get",
                key,
                listener
            });
        },

        onWrite(key: Rumble.SubscribeParams['key'], listener: Rumble.SubscribeParams['listener']) {
            return this.on({
                event: "set",
                key,
                listener
            });
        },

        onRemove(key: Rumble.SubscribeParams['key'], listener: Rumble.SubscribeParams['listener']) {
            return this.on({
                event: "remove",
                key,
                listener
            });
        },

        onClear(listener: Rumble.SubscribeParams['listener']) {
            return this.on({
                event: "clear",
                key: "",
                listener
            });
        },
    }

    return reactiveWrapper;
}

export default SetupStorage;
