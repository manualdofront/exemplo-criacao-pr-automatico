import { exec } from 'child_process';
import { exit } from 'process';
import util from 'util';

const PrStatus = { Ready: 'READY', Draft: 'DRAFT' };

// Criando "syntax sugar" para ter execuções assíncronas mais legíveis.
const asyncExec = util.promisify(exec);

async function main(titulo, labels, status = PrStatus.Ready) {
  await asyncExec('git fetch --all');

  // Pushing my code
  await asyncExec('git push -u origin HEAD');

  // Create PR
  let command = `gh pr create -B main --assignee "@me" --fill-verbose -t "${titulo}" -l "${labels}"`;

  if (status === PrStatus.Draft) {
    command += ` --draft`;
  }

  await asyncExec(command);
}

/**************************
 * ====== Main call ======
 *************************/
const args = process.argv.slice(2);
const [titulo, labels, status] = args;

/**
 * Função principal do arquivo de criação de PR automaticamente.
 * Exemplos:
 *  npm run create:simple:pr "Meu título" "Tag 1,Tag 2"
 *  npm run create:simple:pr "Meu título" "Tag 1,Tag 2" "DrAFt"
 *
 * @param {string} [titulo] The optional description handwritten to give more details about what your PR does.
 * @param {string} [labels] All the labels you want to add to your PR (to add more than one, just separate them with a comma).
 * @param {string} [status] Possui duas opções: 'READY' ou 'DRAFT' (case insensitive). O valor padrão é 'READY'.
 *
 * @returns void
 */
main(titulo, labels, status?.toUpperCase()).catch((e) => {
  console.error(e.message);
  exit(-1);
});
