# scil

[add some some features](https://github.com/scil/rumblejs/tree/master/core)


# Vee

Le stockage local avec `sessionStorage` ou `localStorage`. Mais réactif.

Exemple:

`
window.rls = ReactiveStorage(localStorage);

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


rls.getItem("user") // declenche le callback associé a la lecture.

`

Principe: 

*Vee* encapsule `localStorage` ou `sessionStorage` pour fournir  la meme fonctionnalité que `localStorage` ou `sessionStorage`, mais est capable de réagir a des changement appliqués aux clés stockées par lui, sur demande. Les évenements transitent par l'émetteur associé au document, pour permettre d'avoir les appels aux fonctions sans blocage ou __promisification__.


## Fonctions et attributs disponibles

### readonly length: number
    Retourne le nombre total de clés disponibles dans le stockage


### clear(): void
    Vide le stockage, et declenche l'evenement `clear`. Interceptable avec `onClear`.


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


