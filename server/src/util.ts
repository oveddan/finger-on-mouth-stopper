import {promises as fs} from 'fs'
import {join} from 'path';

export const saveImage =
    async (message: Buffer, folder: string, fileName: string) => {
  await fs.writeFile(join(folder, fileName), message);
}
