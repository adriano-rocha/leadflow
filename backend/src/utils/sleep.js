function sleep(milissegundos) {
  return new Promise((resolve) => setTimeout(resolve, milissegundos));
}

module.exports = sleep;