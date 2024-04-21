type PartialAngularStyleSignal<T> = Accessor<T> & {
  set?: Setter<T>;
};

export const convertSignalToAngularStyleSignal = <T>(signal: Signal<T>) => {
  const getter = signal[0] as PartialAngularStyleSignal<T>;

  getter.set = signal[1];

  return getter as AngularStyleSignal<T>;
};

export const createAngularStyleSignal = <T>(
  value: T,
  options?: SignalOptions<T>,
) => convertSignalToAngularStyleSignal(createSignal(value, options));

export const createASS = createAngularStyleSignal;
