import { observe } from "../object-observer";

describe('DirtyObject', () => {
  it('should not be dirty when created', () => {
    const initialData = { a: 1, b: 2 };
    const [,{ isDirty }] = observe(initialData);
    expect(isDirty()).toBe(false);
  });

  it('should be dirty when a value is changed', () => {
    const initialData = { a: 1, b: 2 };
    const [data, { isDirty }] = observe(initialData);
    data.a = 2;
    expect(isDirty()).toBe(true);
  });

  it('should not be dirty after committing', () => {
    const initialData = { a: 1, b: 2 };
    const [value, { isDirty, commit }] = observe(initialData);
    value.a = 2;
    expect(isDirty()).toBe(true);
    commit();
    expect(isDirty()).toBe(false);
  });

  it('should not be dirty if a value is changed back to the original value', () => {
    const initialData = { a: 1, b: 2 };
    const [data, { isDirty }] = observe(initialData);
    data.a = 2;
    expect(isDirty()).toBe(true);
    data.a = 1;
    expect(isDirty()).toBe(false);
  });

  it('can be revoked', () => {
    const initialData = { a: 1, b: 2 };
    const [data, { revoke } ] = observe(initialData);
    data.a = 2;
    revoke();
    expect(() => {
      data.a = 1;
    }).toThrow("Cannot perform 'set' on a proxy that has been revoked");
  });

  it('returns the current value when revoked', () => {
    const initialData = { a: 1, b: 2 };
    const [observedData, { revoke }] = observe(initialData);
    observedData.a = 2;
    expect(revoke()).toEqual({ a: 2, b: 2 });
  });
});
