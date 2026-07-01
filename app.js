const app = document.getElementById('app');
function route() {
  const hash = location.hash.slice(1) || '/';
  app.innerHTML = `<pre>route: ${hash}</pre>`;
}
addEventListener('hashchange', route); route();
