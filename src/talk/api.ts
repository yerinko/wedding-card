import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password: string) => {
  ((await scrypt(password, "D7zboYc4Uc", 16)) as Buffer).toString("hex");
};
