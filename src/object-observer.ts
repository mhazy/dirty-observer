type DirtyFlags = { [K: string | symbol]: boolean };

type CommitDataFunction = () => void;

type IsDirtyFunction = () => boolean;

type RevokeFunction<T> = () => T;

type WatchedObjectFunctions<T> = {
  isDirty: IsDirtyFunction;
  commit: CommitDataFunction;
  revoke: RevokeFunction<T>;
}

type WatchedObjectResult<T> = [T, WatchedObjectFunctions<T>];

export function observe<T extends Record<string | symbol, string | number | boolean> = never>(obj: T): WatchedObjectResult<T> {
  const dirtyFlags = createDirtyFlags(obj);
  let committedValue = copyObject(obj);

  const proxy = Proxy.revocable(committedValue, {
    get(target, key) {
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      // Value is the same as the initial value, so we can mark it as clean.
      dirtyFlags[key] = committedValue[key] !== value;
      return Reflect.set(target, key, value);
    },
  });

  function isDirty() {
    return Object.values(dirtyFlags).some(Boolean);
  }

  function commit() {
    committedValue = copyObject(proxy.proxy);
    Object.keys(dirtyFlags).forEach(key => {
      dirtyFlags[key] = false;
    });
  }

  function revoke() {
    const latestValue = copyObject(proxy.proxy);
    proxy.revoke();
    return latestValue;
  }

  // TODO: Add a revoke function to the return value.

  return [proxy.proxy, { isDirty, commit, revoke }];
}

function createDirtyFlags<Data extends object>(obj: Data): DirtyFlags {
  return Object.keys(obj)
    .reduce((acc, key) => {
      return ({...acc, [key]: false});
    }, {});
}

function copyObject<Data extends object>(data: Data): Data {
  return JSON.parse(JSON.stringify(data));
}
