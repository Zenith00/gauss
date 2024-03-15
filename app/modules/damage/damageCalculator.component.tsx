
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  NumberInput,
  Paper,
  Select,
  TextInput
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import React, { useEffect, useMemo } from "react";
// import workerpool from "workerpool";

// import type { formValue } from "./math";
// import { getEmptyDamager } from "./math";
import { Updater } from "use-immer";

import { getEmptyDamager, type DamageInfo } from "./mathWorker";
// import type { DamagePMFByAC } from "./types";

// const pool = workerpool.pool("/workers/mathWorker.js");

const DamageCalculatorInput = ({
  form,
  setDamageData,
}: {
  form,
  setDamageData: Updater<Record<string, DamageMetadata>>;
}) => {


  const [worker, setWorker] = React.useState<Worker | null>(null);

  useEffect(() => {
    setWorker(
      () => new Worker(new URL("/workers/mathWorker.js", import.meta.url)),
    );
  }, []);
  
  const extractDamageMetadata = (formValues: formValue): DamageInfo[] =>
    formValues.damagers.map((damager) => ({
      damage: [damager.damage, formValues.global.damage].filter((x) => x),
      attack: [damager.attack, formValues.global.attack].filter((x) => x),
      damageOnMiss: damager.damageOnMiss,
      damageOnFirstHit: damager.damageOnFirstHit,
      attackCount: Number(damager.attackCount),
      critFaceCount: damager.critFaceCount,
      critFailFaceCount: damager.critFailFaceCount,
      advantage: Number(damager.advantage),
      key: damager.key.toString(),
      gwmSS: damager.gwmSS,
      label: damager.label
    }));

  React.useEffect(() => {
    extractDamageMetadata(form.values).forEach((dmgArg) => {
      if (window.Worker && worker){
        console.log("wroker")
        worker.postMessage(dmgArg)
      }
    });
  }, [form.values, setDamageData]);

  useEffect(() => {
    if (worker){
      worker.onmessage = (event: MessageEvent<DamageResult>) => {
        console.log("worker message")
        console.log({event});
        const damageInfo = event.data;
        setDamageData((draft) => {
          draft[damage]
        })
      }
    }
  }, [worker]);

  // React.useEffect(() => {
  //   console.log("PDS");
  //   console.log(parseDiceStrings({diceStrings: [ "1d20", form.values.damagers[0].attack]}));
  // }, [form.values]);

  return (
    <Box>
      <Paper maw={320} mr="auto" my="sm" p="sm" shadow="sm">
        <Flex>
          <TextInput
            label="Global Attack"
            placeholder="Attack Bonus"
            mt="s"
            size="s"
            {...form.getInputProps("global.attack")}
          />
          <TextInput
            label="Global Damage"
            placeholder="Damage Bonus"
            mt="s"
            size="s"
            {...form.getInputProps("global.damage")}
          />
        </Flex>
      </Paper>
        <Button  onClick={() => form.insertListItem("damagers", getEmptyDamager(form.values.damagers) , form.values.damagers.length+1)}>New Damager</Button>
        
      {form.values.damagers.map((item, index) => (
        <Group key={item.key} mt="xs">

          <Paper maw={320} p="sm" my="sm" mr="auto" shadow="sm">
          <Flex px="md" align="center">
          <TextInput
                    placeholder="Label"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.label`)}
                  />
            <ActionIcon style={{marginRight: "0", marginLeft:"auto"}} color="red" >
              <IconTrash />
            </ActionIcon>
          </Flex>
            <Accordion defaultValue={["basic"]} multiple>
              <Accordion.Item value="basic">
                <Accordion.Control>Basic</Accordion.Control>
                <Accordion.Panel>
                  {/* <TextInput
                    label="Label"
                    placeholder="Label"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.label`)}
                  /> */}
                  <TextInput
                    label="Damage"
                    placeholder="1d12"
                    mt="s"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.damage`)}
                  />
                  <TextInput
                    label="Attack Modifiers"
                    placeholder="1d4"
                    mt="s"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.attack`)}
                  />
                  <NumberInput
                    label="Attack Count"
                    placeholder="1"
                    {...form.getInputProps(`damagers.${index}.attackCount`)}
                    styles={{
                      input: { height: "1.75rem", minHeight: "1.75rem" },
                    }}
                  />
                  <Select
                    size="sm"
                    label="Advantage"
                    defaultValue="0"
                    styles={{
                      input: { height: "1.75rem", minHeight: "1.75rem" },
                    }}
                    data={[
                      { label: "Disadv+", value: "-2" },
                      { label: "Disadv", value: "-1" },
                      { label: "Normal", value: "0" },
                      { label: "Adv", value: "1" },
                      { label: "Adv+ (Elven Accuracy)", value: "2" },
                    ]}
                    {...form.getInputProps(`damagers.${index}.advantage`)}
                  />
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="conditional">
                <Accordion.Control>Conditional</Accordion.Control>
                <Accordion.Panel>
                  <TextInput
                    label="Damage on miss"
                    placeholder="Label"
                    size="s"
                    {...form.getInputProps(`damagers.${index}.damageOnMiss`)}
                  />
                  <TextInput
                    label="Damage on first hit"
                    placeholder=""
                    mt="s"
                    size="s"
                    {...form.getInputProps(
                      `damagers.${index}.damageOnFirstHit`
                    )}
                  />
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="playerstats">
                <Accordion.Control>Player Details</Accordion.Control>
                <Accordion.Panel>
                  <NumberInput
                    label="Crit Faces"
                    placeholder="1"
                    {...form.getInputProps(`damagers.${index}.critFaceCount`)}
                  />
                  <NumberInput
                    label="Crit Fail Faces"
                    placeholder="1"
                    {...form.getInputProps(
                      `damagers.${index}.critFailFaceCount`
                    )}
                  />

                  {/* <Switch
                    label="GWM/SS"
                    {...form.getInputProps(`damagers.${index}.gwmss`)}
                  /> */}
                </Accordion.Panel>
              </Accordion.Item>
              {/* <Text size="sm" weight={500} mt="xl">
              Form values:
            </Text> */}
            </Accordion>
          </Paper>
        </Group>
      ))}
    </Box>
  );
};

export default DamageCalculatorInput;
