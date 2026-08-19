import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..", "..");
const frontendDir = path.resolve(__dirname, "..", "..");
const evidenciasDir = path.join(rootDir, "evidencias");

dotenv.config({ path: path.join(frontendDir, ".env.e2e") });

if (!fs.existsSync(evidenciasDir)) {
  fs.mkdirSync(evidenciasDir, { recursive: true });
}

const collectionPath = path.join(__dirname, "practinexo.postman_collection.json");
const environmentPath = path.join(__dirname, "practinexo.postman_environment.json");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const htmlOut = path.join(evidenciasDir, `newman-report-${timestamp}.html`);
const jsonOut = path.join(evidenciasDir, `newman-report-${timestamp}.json`);
const junitOut = path.join(evidenciasDir, `newman-report-${timestamp}.xml`);

const envApiBase = process.env.E2E_API_BASE_URL;
const envAdminEmail = process.env.E2E_ADMIN_EMAIL;
const envAdminPassword = process.env.E2E_ADMIN_PASSWORD;
const envStudentEmail = process.env.E2E_STUDENT_EMAIL;
const envStudentPassword = process.env.E2E_STUDENT_PASSWORD;

if (!envAdminEmail || !envAdminPassword || !envStudentEmail || !envStudentPassword) {
  console.error(
    "Faltan credenciales E2E para Newman. Define E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_STUDENT_EMAIL y E2E_STUDENT_PASSWORD en variables de entorno o frontend/.env.e2e",
  );
  process.exit(1);
}

const runner = process.execPath;
const newmanCli = path.join(frontendDir, "node_modules", "newman", "bin", "newman.js");

const args = [
  newmanCli,
  "run",
  collectionPath,
  "-e",
  environmentPath,
  ...(envApiBase ? ["--env-var", `baseUrl=${envApiBase}`] : []),
  ["--env-var", `adminEmail=${envAdminEmail}`],
  ["--env-var", `adminPassword=${envAdminPassword}`],
  ["--env-var", `studentEmail=${envStudentEmail}`],
  ["--env-var", `studentPassword=${envStudentPassword}`],
  "--reporters",
  "cli,htmlextra,json,junit",
  "--reporter-htmlextra-export",
  htmlOut,
  "--reporter-json-export",
  jsonOut,
  "--reporter-junit-export",
  junitOut,
].flat();

const child = spawn(runner, args, {
  cwd: frontendDir,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
