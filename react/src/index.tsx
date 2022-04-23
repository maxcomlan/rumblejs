import React, { ComponentType, createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { cast, Rumble } from "rumblejs";

const StorageContext = createContext<Rumble.ReactiveStorage>( {} as any );

export function useReactiveStorage() {
    let value = useContext(StorageContext);
    if(!value) {
        throw new Error("ReactiveStorage not found. ");
    }
    return value;
}

export function useReactiveObject<T>(key: string) {
    const storage = useReactiveStorage();
    const [value, setValue] = useState<T>();

    useEffect(() => {

        let v = storage.getObject(key);
        setValue(v);

        let writeSubscription = storage.onWrite(key, (ev) => {
            setValue(cast(ev.value, "object"));
        });

        let deleteSubscription = storage.onRemove(key, (ev) => {
            setValue(undefined);
        });

        return () => {
            writeSubscription.cancel();
            deleteSubscription.cancel();
        }

    }, []);

    return {
        value,
        update(v: T) {
            storage.setObject(key, v);
        }
    }
}

export function useReactiveString(key: string) {
    const storage = useReactiveStorage();
    const [value, setValue] = useState<string>();

    useEffect(() => {

        let v = storage.getString(key);
        setValue(v);

        let writeSubscription = storage.onWrite(key, (ev) => {
            setValue(cast(ev.value, "string"));
        });

        let deleteSubscription = storage.onRemove(key, (ev) => {
            setValue(undefined);
        });

        return () => {
            writeSubscription.cancel();
            deleteSubscription.cancel();
        }

    }, []);

    return {
        value,
        update(v: string) {
            storage.setString(key, v);
        }
    }
}

export function useReactiveNumber(key: string) {
    const storage = useReactiveStorage();
    const [value, setValue] = useState<number>();

    useEffect(() => {

        let v = storage.getNumber(key);
        setValue(v);

        let writeSubscription = storage.onWrite(key, (ev) => {
            setValue(cast(ev.value, "number"));
        });

        let deleteSubscription = storage.onRemove(key, (ev) => {
            setValue(undefined);
        });

        return () => {
            writeSubscription.cancel();
            deleteSubscription.cancel();
        }

    }, []);

    return {
        value,
        update(v: string) {
            storage.setString(key, v);
        }
    }
}

export function useReactiveBoolean(key: string) {
    const storage = useReactiveStorage();
    const [value, setValue] = useState<boolean>();

    useEffect(() => {

        let v = storage.getBoolean(key);
        setValue(v);

        let writeSubscription = storage.onWrite(key, (ev) => {
            setValue(cast(ev.value, "boolean"));
        });

        let deleteSubscription = storage.onRemove(key, (ev) => {
            setValue(undefined);
        });

        return () => {
            writeSubscription.cancel();
            deleteSubscription.cancel();
        }

    }, []);

    return {
        value,
        update(v: string) {
            storage.setString(key, v);
        }
    }
}

export function ProvideReactiveStorage({ children, storage }: PropsWithChildren<{ storage: Rumble.ReactiveStorage }> ) {
    return <StorageContext.Provider value={storage}>
        { children }
    </StorageContext.Provider>
}