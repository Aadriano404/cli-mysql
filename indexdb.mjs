import { createPool } from "mysql2";
import inquirer from "inquirer";
import { readdir, writeFileSync } from "fs";
import cliSpinners from "cli-spinners";
import chalk from "chalk";
import ora, { spinners } from "ora";
import { exec } from "child_process";
import { info } from "console";
import { stderr, stdout } from "process";
import {
  scryptSync,
  createHash,
  randomBytes,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
} from "crypto";
import { createHmac } from "node:crypto";
import { createConnection } from "net";

async function saltCutter(info) {
  const Thehash = createHash("sha256");
  const salt = info.slice(info.length * 0.5, info.length);
  Thehash.update(salt);
  const theNewSalt = Thehash.digest("hex");
  return theNewSalt;
}

export default async function saltnHash(creds) {
  const salt = await saltCutter(creds);
  const hash = scryptSync(creds, salt, 64).toString("hex");
  const password = `${salt}:${hash}`;
  return password;
}

const spinner = ora({
  text: "  loading...",
  spinner: cliSpinners.aesthetic,
  color: "red",
});

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

async function hashTheInfo() {
  const dbinfo = await getPoolInfo()[0];
  const encryptedCreds = {
    HostNam: await saltnHash(dbinfo.hostName),
    UserNam: await saltnHash(dbinfo.userName),
    passwor: await saltnHash(dbinfo.password),
    DBnam: await saltnHash(dbinfo.DBname),
  };

  return encryptedCreds;
}

async function createENV(envName) {
  const cryptCreds = await hashTheInfo();
  process.chdir("C:/projetos/JSstuff/dataBtry");
  spinner.start("wait...");

  try {
    spinner.stop();
    const contentPreForm = `
hostName=${cryptCreds.HostNam}
userName=${cryptCreds.UserNam}
password=${cryptCreds.passwor}
DBname=${cryptCreds.DBnam}`;

    writeFileSync(`${envName}.env`, contentPreForm);

    spinner.succeed("the env is done");
  } catch (error) {
    console.error(` FAZ O L: ${stderr}`);
    console.error(`FAÇA O ELI :${err}`);
    spinner.fail("env is not");
  }
}

//await createENV("juleubiros")

async function getQuery() {
  let { query } = await inquirer.prompt({
    name: "query",
    type: "input",
    message: "type your query",
  });
  return query.trim();
}

class createPoole {
  constructor(host, user, password, database) {
    this.pool = createPool({
      host: host,
      user: user,
      password: password,
      database: database,
    });
    return this.pool;
    //eu sou terrivel com classes eu raramente uso no js, no C# uso mais mas la é diferente
  }
}
async function getEyja() {
  const info = await getPoolInfo();
  const eyjacobec = createPool({
    host: info.hostName,
    user: info.userName,
    password: info.password,
    database: info.DBname,
  });
  return eyjacobec;
}

async function executeQuery(conObj, query) {
  try {
    const con = await getEyja();
    const [results] = con.execute(query);
    return results;
  } catch (err) {
    spinner.fail("error");
    console.error(err);
    //await startApp();
  }
}

//aqui começou a ficar estranho, mas eu acho que se eu fizer uma conexao normal eu
//posso deixar ligada igual no express, se sim da pra arrumar isso ainda e tirar a necessidade
//de ficar logando na database toda vez que for mandar uma query, aí a recursiva funciona

async function recursiveQuery(conObj, LeQuarre) {
  try {
    const results = await executeQuery(conObj, LeQuarre);
    if (!results.error) {
      spinner.succeed("done");
      await logResults(results);
    }
  } catch (err) {
    spinner.fail();
    console.error(err);
  }
}

async function logResults(results) {
  console.log(chalk.bold(chalk.green("Here's your results:")));
  console.table(results);
}

async function callDB() {
  try {
    const eyjacobec = await getEyja();

    const LeQuarre = await getQuery();
    if (LeQuarre === "exit") {
      process.exit(0);
    }
    await recursiveQuery(eyjacobec, LeQuarre);
  } catch (err) {
    spinner.fail("error");
    console.error(`Error: ${err}`);
  }
}

async function startApp() {
  //spinner.start("loading");
  try {
    spinner.succeed("done");
    await callDB();
  } catch (err) {
    console.error(err);
    spinner.fail();
  }
}

await startApp();
