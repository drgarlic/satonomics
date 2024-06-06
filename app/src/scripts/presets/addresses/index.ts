import {
  addressCohortsBySize,
  addressCohortsByType,
  applyMultipleSeries,
  colors,
  createCohortPresetList,
  liquidities,
  SeriesType,
} from "/src/scripts";

export function createPresets({
  scale,
  datasets,
}: {
  scale: ResourceScale;
  datasets: Datasets;
}): PartialPresetFolder {
  return {
    id: `${scale}-addresses`,
    name: "Addresses",
    tree: [
      {
        id: `${scale}-total-non-empty-addresses`,
        name: `Total Non Empty Addresses`,
        title: `Total Non Empty Address`,
        description: "",
        icon: IconTablerWallet,
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                title: `Total Non Empty Address`,
                color: colors.bitcoin,
                seriesType: SeriesType.Area,
                dataset: params.datasets[scale].address_count,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-new-addresses`,
        name: `New Addresses`,
        title: `New Addresses`,
        description: "",
        icon: IconTablerSparkles,
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                title: `New Addresses`,
                color: colors.white,
                dataset: params.datasets[scale].created_addresses,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-total-addresses-created`,
        name: `Total Addresses Created`,
        title: `Total Addresses Created`,
        description: "",
        icon: IconTablerArchive,
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                title: `Total Addresses Created`,
                color: colors.bitcoin,
                seriesType: SeriesType.Area,
                dataset: params.datasets[scale].created_addresses,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-total-empty-addresses`,
        name: `Total Empty Addresses`,
        title: `Total Empty Addresses`,
        description: "",
        icon: IconTablerTrash,
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                title: `Total Empty Addresses`,
                color: colors.darkWhite,
                seriesType: SeriesType.Area,
                dataset: params.datasets[scale].empty_addresses,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-addresses-by-size`,
        name: "By Size",
        tree: addressCohortsBySize.map(({ key, name }) =>
          createAddressPresetFolder({
            datasets,
            scale,
            id: key,
            color: colors[key],
            name,
            datasetKey: key,
          }),
        ),
      },
      {
        id: `${scale}-addresses-by-type`,
        name: "By Type",
        tree: addressCohortsByType.map(({ key, name }) =>
          createAddressPresetFolder({
            datasets,
            scale,
            id: key,
            color: colors[key],
            name,
            datasetKey: key,
          }),
        ),
      },
    ],
  } satisfies PartialPresetFolder;
}

function createAddressPresetFolder<Scale extends ResourceScale>({
  datasets,
  scale,
  id,
  color,
  name,
  datasetKey,
}: {
  datasets: Datasets;
  scale: Scale;
  id: string;
  name: string;
  datasetKey: AddressCohortKey;
  color: string;
}): PartialPresetFolder {
  return {
    id: `${scale}-addresses-${id}`,
    name,
    tree: [
      createAddressCountPreset({ scale, id, name, datasetKey, color }),
      ...createCohortPresetList({
        title: name,
        datasets,
        scale,
        color,
        datasetKey,
        id,
      }),
      {
        id: `${scale}-addresses-${id}-liquidity`,
        name: `Split By Liquidity`,
        tree: liquidities.map((liquidity): PartialPresetFolder => {
          const _id = `${scale}-${id}-${liquidity.route}`;

          return {
            id: _id,
            name: liquidity.name,
            tree: createCohortPresetList({
              title: name,
              datasets,
              scale,
              color,
              datasetKey: `${datasetKey}${liquidity.key}`,
              id: _id,
            }),
          };
        }),
      },
    ],
  };
}

export function createAddressCountPreset<Scale extends ResourceScale>({
  scale,
  id,
  color,
  name,
  datasetKey,
}: {
  scale: Scale;
  id: string;
  name: string;
  datasetKey: AddressCohortKey;
  color: string;
}): PartialPreset {
  return {
    id: `${scale}-${id}-address-count`,
    name: `Address Count`,
    title: `${name} Address Count`,
    icon: IconTablerAddressBook,
    applyPreset(params) {
      return applyMultipleSeries({
        scale,
        ...params,
        priceScaleOptions: {
          halved: true,
        },
        list: [
          {
            id: "address-count",
            title: "Address Count",
            color,
            dataset: params.datasets[scale][`${datasetKey}_address_count`],
          },
        ],
      });
    },
    description: "",
  };
}
