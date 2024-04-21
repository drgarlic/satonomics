// import { Sticky } from '/src/components'
// import { FIVE_SECOND_IN_MS } from '/src/scripts'
// import { createASS } from '/src/solid'

// interface Props {
//   resources: ResourcesHTTP
// }

// export const Update = (props: Props) => {
//   const updateAvailable = createASS(false)

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
//   return (
//     <Show when={updateAvailable()}>
//       <Sticky onClose={() => updateAvailable.set(false)}>
//         <span> A new version is available. </span>{' '}
//         <span class="inline-block">
//           <a class="font-bold text-white underline" href="/">
//             Restart <span aria-hidden="true">&rarr;</span>
//           </a>
//         </span>
//       </Sticky>
//     </Show>
//   )
// }
