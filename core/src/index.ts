export type VeeEvent = "set" | "get" | "remove" | "clear";

export type VeeEventListener = (event: VeeEvent, details: VeeReaction) => any;

export interface VeeReaction {
    event: VeeEvent,
    key?: string;
    value?: any;
    [key: string]: any;
}

export type VeeSubscription = {
    id: string;
    event: VeeEvent;
    key?: string;
    listener: VeeEventListener;
    cancel: () => any
}

type VeeSubscribeParams = {
    event: VeeEvent,
    listener: VeeEventListener,
    key?: string,
}

interface VeeStorage {
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
    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     *
     * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
     *
     * Dispatches a storage event on Window objects holding an equivalent Storage object.
     */
    setItem(key: string, value: string): void;

    /**
     * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
     */
    on(params: VeeSubscribeParams): VeeSubscription;
    /**
     * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
     */
    onRead(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']): VeeSubscription;
    /**
      * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
      */
    onWrite(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']): VeeSubscription;
    /**
     * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
     */
    onRemove(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']): VeeSubscription;
    /**
    * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
    */
    onClear(listener: VeeSubscribeParams['listener']): VeeSubscription;
    /**
     * Store the given listener as a subscription function that can later react to changes made on the storage block, through exposed functions;
     */
    on(params: VeeSubscribeParams): VeeSubscription;
    [key: string]: any;
}

function Vee(block: Storage): VeeStorage {
    let reactiveWrapper = {
        $__id: crypto.randomUUID(),
        $__block: block,
        $__buildEvent(ev: VeeEvent) {
            return `storage.reactive.${this.$__id}/${ev}`;
        },
        $__dispatch(ev: VeeEvent, details: any) {
            document.dispatchEvent(
                new CustomEvent<VeeReaction>(
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

        get length() {
            return block.length;
        },

        key(idx: number) {
            return block.key(idx);
        },

        getItem(key: string) {
            let reflect = block.getItem(key);
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
            return block.getItem(key);
        },

        getObject(key: string) {
            let item = block.getItem(key);
            if (!item) {
                return null;
            }
            try {
                let parsed = JSON.parse(item);
                return parsed;
            } catch (error) {
                return null;
            }
        },

        getNumber(key: string) {
            let item = block.getItem(key);
            if (!item) {
                return null;
            }
            try {
                let parsed = parseFloat(item);
                return parsed;
            } catch (error) {
                return null;
            }
        },

        getBoolean(key: string) {
            let item = block.getItem(key);
            if (!item) {
                return false;
            }
            try {
                let parsed = ["true", '1'].includes(item.toLowerCase());
                return parsed;
            } catch (error) {
                return false;
            }
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

        setItem(key: string, value: string) {
            let previous = this.getItem(key);
            block.setItem(key, value);
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
            this.$__dispatch(
                "clear",
                {
                    key: "",
                    value: ""
                }
            );
        },

        on(params: VeeSubscribeParams) {
            let rx = this;
            let documentListener = (ev: CustomEvent<VeeReaction>) => {
                if(ev.detail.key === params.key) {
                    params.listener(ev.detail.event, ev.detail);
                }
            }
            document.addEventListener(this.$__buildEvent(params.event) as any, documentListener);
            let subscription: VeeSubscription = {
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

        onRead(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']) {
            return this.on({
                event: "get",
                key,
                listener
            });
        },

        onWrite(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']) {
            return this.on({
                event: "set",
                key,
                listener
            });
        },

        onRemove(key: VeeSubscribeParams['key'], listener: VeeSubscribeParams['listener']) {
            return this.on({
                event: "remove",
                key,
                listener
            });
        },

        onClear(listener: VeeSubscribeParams['listener']) {
            return this.on({
                event: "clear",
                key: "",
                listener
            });
        },
    }

    return reactiveWrapper;
}

export default Vee;