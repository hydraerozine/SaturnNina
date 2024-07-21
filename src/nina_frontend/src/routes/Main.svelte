<script>
  import "../index.scss";
  import { backend } from "$lib/canisters";
  import PhantasmaLogin from './PhantasmaLogin.svelte';
  import BinanceLogin from './BinanceLogin.svelte';
  import SolanaLogin from './SolanaLogin.svelte';

  let greeting = "";

  function onSubmit(event) {
      const name = event.target.name.value;
      backend.greet(name).then((response) => {
          greeting = response;
      });
      return false;
  }
</script>

<main>
  <img src="/logo2.svg" alt="DFINITY logo" style="margin-bottom: 10px;" />
  <br />
  <PhantasmaLogin />
  <br />
  <BinanceLogin />
  <br />
  <SolanaLogin />
  <br />
  <section id="greeting">{greeting}</section>
</main>

<style>
  img {
      display: block;
      margin: 0 auto 10px;
  }
  main {
      text-align: center;
      padding: 20px;
  }
</style>