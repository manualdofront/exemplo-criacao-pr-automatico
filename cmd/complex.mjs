import { exec } from 'child_process';
import { exit } from 'process';
import util from 'util';

const PrStatus = { Ready: 'READY', Draft: 'DRAFT' };

// Criando "syntax sugar" para ter execuções assíncronas mais legíveis.
const asyncExec = util.promisify(exec);

// Função para melhorar os logs do script e debuggar a execução mais facilmente.
let counterLog = 1;
const log = (message) => {
  console.log(`${counterLog++}. ${message}`);
};

async function main(titulo, labels, status = PrStatus.Ready) {
  log('Iniciando o processo com a sincronização e atualização da branch...');
  await asyncExec('git fetch --all');

  // Pushing my code
  log('Atualizando a referência remota...');
  await asyncExec('git push -u origin HEAD');

  // Create PR
  let command = `gh pr create -B main --assignee "@me" --fill-verbose -t "${titulo}" -l "${labels}"`;

  if (status === PrStatus.Draft) {
    command += ` --draft`;
  }

  log('Criando o Pull...');
  const { stderr, stdout: linkToTheNewPR } = await asyncExec(command);

  if (linkToTheNewPR) {
    log(`Processo completado com sucesso! Aqui está o link para seu Pull Request: ${linkToTheNewPR}`);
  } else {
    log(`Erro: ${stderr}`);
  }
}

/**************************
 * ====== Main call ======
 *************************/
const args = process.argv.slice(2);
const [titulo, labels, status] = args;

/**
 * Função principal do arquivo de criação de PR automaticamente.
 * Exemplos:
 *  npm run create:pr:complex "Meu título" "bug"
 *  npm run create:pr:complex "Meu título" "bug,documentation" "DrAFt"
 *
 * @param {string} [titulo] O título que será adicionado ao seu Pull Request.
 * @param {string} [labels] Todas as tags/labels que você deseja "etiquetar" seu PR. Lembre-se: eles precisam estar criados no github ANTES de executar esse script. Para adicionar mais de um, separe eles com vírgula.
 * @param {string} [status] Possui duas opções: 'READY' ou 'DRAFT' (case insensitive). O valor padrão é 'READY'.
 *
 * @returns void
 */
main(titulo, labels, status?.toUpperCase()).catch((e) => {
  console.error(e.message);
  exit(-1);
});
