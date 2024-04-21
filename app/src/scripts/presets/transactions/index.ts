import { applyMultipleSeries, colors } from "/src/scripts";

export function createPresets(scale: ResourceScale) {
  return {
    id: `${scale}-transactions`,
    name: "Transactions",
    tree: [
      {
        id: `${scale}-transaction-count`,
        icon: IconTablerHandThreeFingers,
        name: "Count",
        title: "Transaction Count",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "transaction-count",
                title: "Transaction Count",
                color: colors.bitcoin,
                dataset: params.datasets[scale].transactionCount,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-transaction-volume`,
        icon: IconTablerVolume2,
        name: "Volume",
        title: "Transaction Volume",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "transaction-volume",
                title: "Transaction Volume",
                color: colors.bitcoin,
                dataset: params.datasets[scale].transactionVolume,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-transaction-volume-annualized`,
        icon: IconTablerVolume,
        name: "Volume Annualized",
        title: "Transaction Volume Annualized",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "transaction-volume-annualized",
                title: "Transaction Volume Annualized",
                color: colors.bitcoin,
                dataset: params.datasets[scale].transactionVolumeAnnualized,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-transactions-velocity`,
        icon: IconTablerWind,
        name: "Velocity",
        title: "Transactions Velocity",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "transactions-velocity",
                title: "Transactions Velocity",
                color: colors.bitcoin,
                dataset: params.datasets[scale].transactionsVelocity,
              },
            ],
          });
        },
      },
    ],
  } satisfies PresetFolder;
}
