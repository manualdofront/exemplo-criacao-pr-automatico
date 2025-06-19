import { exec } from 'child_process';
import { exit } from 'process';
import util from 'util';

// Criando "syntax sugar" para ter execuções assíncronas mais legíveis.
const asyncExec = util.promisify(exec);

async function main(titulo) {
  await asyncExec('git fetch --all');
  await asyncExec('git push -u origin HEAD');

  // Criando o Pull Request
  let command = `gh pr create -B main --fill-verbose -t "${titulo}"`;

  await asyncExec(command);
}

/**************************
 * ====== Main call ======
 *************************/
const args = process.argv.slice(2);
const [titulo] = args;

/**
 * Função principal do arquivo de criação de PR automaticamente.
 * Exemplo:
 *  npm run create:pr:simple "Meu título"
 *
 * @param {string} [titulo] The optional description handwritten to give more details about what your PR does.
 *
 * @returns void
 */
main(titulo).catch((e) => {
  console.error(e.message);
  exit(-1);
});
