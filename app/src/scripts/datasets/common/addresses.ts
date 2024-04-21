import {
  createNetChangeLazyDataset,
  createResourceDataset,
  createSubtractedLazyDataset,
} from "../base";

export function createAddressesDatasets<Scale extends ResourceScale>(
  scale: Scale,
) {
  const totalAddressesCreated = createResourceDataset({
    scale,
    path: `/${scale}-to-total_addresses_created`,
  });

  const totalEmptyAddresses = createResourceDataset({
    scale,
    path: `/${scale}-to-total_empty_addresses`,
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
