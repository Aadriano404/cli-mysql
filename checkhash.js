import inquirer from "inquirer";
import { readFileSync, readdir, writeFileSync } from "fs";
import { scryptSync, timingSafeEqual } from "crypto";
import { createHmac } from "node:crypto";
import saltnHash from "./indexdb.mjs";
import { chdir } from "process";
import { log } from "console";
import chalk from "chalk";

export function chalkITgreen(text) {
  return chalk.green(chalk.bold(text));
}

export function chalkITblue(text) {
  return chalk.blue(chalk.bold(text));
}

async function getPoolInfo() {
  const dbinfo = await inquirer.prompt([
    {
      type: "input",
      name: "hostName",
      message: "enter the host name",
    },
    {
      type: "input",
      name: "userName",
      message: "enter the username",
    },
    {
      type: "password",
      name: "password",
      message: "enter the password",
    },
    {
      type: "input",
      name: "DBname",
      message: "enter the database name",
    },
  ]);
  return dbinfo;
}

async function IterateValidation(array1, array2) {
  //essa parte era pra entender oq tava acontecendo pq
  // tava dando uns erros que retornava true mesmo
  // que os hashes nao fossem iguais
  try {
    const creds1 = {
      credMapProp: array1.map((creds) => {
        return creds;
      }),
    };
    const creds2 = {
      credMapProp: array2.map((creds) => {
        return creds;
      }),
    };
    console.log(creds1, creds2);

    for (let i = 0; i < array1.length; i++) {
      const cred1 = creds1.credMapProp[i];
      const cred2 = creds2.credMapProp[i];

      if (cred1 === cred2) {
        const validCred =
          cred1.slice(cred1 * 0.5, cred1.length) +
          cred2.slice(cred2.length, cred2 * 0.5);
        console.log(validCred === cred1 && cred2 ? validCred : "not valid");
      } else {
        console.log("not valid");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function hashTheInfo() {
  try {
    const dbinfo = await getPoolInfo();
    const encryptedCreds = {
      hostName: await saltnHash(dbinfo.hostName),
      UserName: await saltnHash(dbinfo.userName),
      password: await saltnHash(dbinfo.password),
      DBname: await saltnHash(dbinfo.DBname),
    };

    process.chdir("C:/projetos/jsstuff/databtry");
    //essa parte é pq process.env por algum motivo nao funciona de jeito nenhum
    let HostHash = readFileSync(`${dbinfo.DBname}.env`, "utf-8");
    const envVars = {};
    HostHash.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key] = value;
      }
    });
    return [envVars, encryptedCreds];
  } catch {
    console.log(
      "the credentials does not match any database, please input valid credentials."
    );
    await hashTheInfo();
  }
}

async function CheckAuth() {
  const [storedCreds, givenCreds] = await hashTheInfo();
  const getEmGivenCreds = [];
  const getEmStoredCreds = [];
  for (const prop in await storedCreds) {
    getEmStoredCreds.push(storedCreds[prop]);
  }
  for (const prop in await givenCreds) {
    getEmGivenCreds.push(givenCreds[prop]);
  }

  await IterateValidation(getEmStoredCreds, getEmGivenCreds);
}

await CheckAuth();

//pra rodar esse codigo vc tem que criar um env pra servir como login usando o createENV() da outra parte