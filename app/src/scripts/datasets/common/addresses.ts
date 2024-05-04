import {
  createNetChangeLazyDataset,
  createResourceDataset,
  createSubtractedLazyDataset,
} from "../base";

export function createAddressesDatasets<Scale extends ResourceScale>({
  scale,
  setActiveResources,
}: {
  scale: Scale;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const totalAddressesCreated = createResourceDataset({
    scale,
    path: `/${scale}-to-total_addresses_created`,
    setActiveResources,
  });

  const totalEmptyAddresses = createResourceDataset({
    scale,
    path: `/${scale}-to-total_empty_addresses`,
    setActiveResources,
  });

  return {
    totalAddressesCreated,
    totalEmptyAddresses,
    totalAddressCount: createSubtractedLazyDataset(
      totalAddressesCreated,
      totalEmptyAddresses,
    ),
    newAddressCount: createNetChangeLazyDataset(totalAddressesCreated),
  };
}
