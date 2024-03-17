import { AppShell } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useImmer } from "use-immer";

import DamageCalculatorInput from "~/modules/damage/damageCalculator.component";
import {
  DamageMetadata,
  damagerFormValue,
  getEmptyDamager,
  globalValues,
} from "~/modules/damage/mathWorker";

export interface formValue {
  global: globalValues;
  damagers: damagerFormValue[];
}

function Damage() {
  const form = useForm<formValue>({
    initialValues: {
      global: {
        damage: "",
        attack: "",
      },
      damagers: [getEmptyDamager([])],
    },
  });

  const [damageData, setDamageData] = useImmer<Record<string, DamageMetadata>>(
    {},
  );
  useEffect(() => {
    console.log({ damageData });
  }, [damageData]);
  return (
    <AppShell>
      <DamageCalculatorInput form={form} setDamageData={setDamageData} />
    </AppShell>
  );
}

export default Damage;
