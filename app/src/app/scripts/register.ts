import { useRegisterSW } from "virtual:pwa-register/solid";

const intervalMS = 5 * 60 * 1000;

export function registerServiceWorker() {
  return useRegisterSW({
    onRegisteredSW(swUrl, registered) {
      console.log("sw: registered", registered);

      registered &&
        setInterval(async () => {
          if (!(!registered.installing && navigator)) return;

          if ("connection" in navigator && !navigator.onLine) return;

          const resp = await fetch(swUrl, {
            cache: "no-store",
            headers: {
              cache: "no-store",
              "cache-control": "no-cache",
            },
          });

          if (resp?.status === 200) {
            await registered.update();
          }
        }, intervalMS);
    },
    onRegisterError(error) {
      console.log("sw: registration error", error);
    },
    onNeedRefresh() {
      console.log("sw: needs refresh");
    },
  });
}

// From update.tsx
//   onMount(async () => {
//     if ('serviceWorker' in navigator) {
//       try {
//         const registration = await navigator.serviceWorker.register('/sw.js')

//         registration.addEventListener('updatefound', () => {
//           const worker = registration.installing

//           worker?.addEventListener('statechange', () => {
//             if (
//               worker.state === 'activated' &&
//               navigator.serviceWorker.controller
//             ) {
//               ;(Object.entries(props.resources) as Entries<ResourcesHTTP>)
//                 .map(([_, value]) => value.fetch)
//                 .forEach((fetch) => fetch())

//               setTimeout(() => updateAvailable.set(true), FIVE_SECOND_IN_MS)
//             }
//           })
//         })
//       } catch {}
//     }
//   })
