type AngularStyleSignal<T> = Accessor<T> & {
  readonly set: Setter<T>;
};

type ASS<T> = AngularStyleSignal<T>;
