import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="site-header">
    <div class="page-container">
      <p class="eyebrow">Clima agora</p>
      <h1>Consulte o clima da sua cidade</h1>
      <p class="intro">Descubra as condições meteorológicas atuais em qualquer lugar.</p>
    </div>
  </header>

  <main class="page-container">
    <form id="search-form" class="search-form" novalidate>
      <div class="search-field">
        <label for="city-input">Cidade</label>
        <div class="search-controls">
          <input
            id="city-input"
            name="city"
            type="text"
            autocomplete="address-level2"
            placeholder="Ex.: São Paulo"
            aria-describedby="city-hint city-error"
            aria-invalid="false"
          />
          <button id="search-button" type="submit">Buscar clima</button>
        </div>
        <p id="city-hint" class="field-hint">Digite o nome de uma cidade para começar.</p>
        <p id="city-error" class="field-error" role="alert"></p>
      </div>
    </form>

    <section id="weather-panel" class="weather-panel" aria-labelledby="results-heading">
      <h2 id="results-heading" class="sr-only">Resultado do clima</h2>
      <aside class="weather-summary" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Resumo</h3>
        <div id="summary-content"></div>
      </aside>
      <section class="weather-details" aria-labelledby="details-heading">
        <h3 id="details-heading">Detalhes meteorológicos</h3>
        <div id="details-content"></div>
      </section>
    </section>

    <section id="initial-state" class="message-panel" aria-labelledby="initial-heading">
      <h2 id="initial-heading">Pesquise uma cidade</h2>
      <p>Informe uma cidade acima para ver o clima atual.</p>
    </section>

    <div id="loading-message" class="message-panel" role="status" aria-live="polite" hidden>
      <p>Buscando o clima...</p>
    </div>
    <div id="status-message" class="message-panel" role="status" aria-live="polite" hidden></div>
  </main>
`

const form = document.querySelector<HTMLFormElement>('#search-form')!
const cityInput = document.querySelector<HTMLInputElement>('#city-input')!
const searchButton = document.querySelector<HTMLButtonElement>('#search-button')!
const cityError = document.querySelector<HTMLParagraphElement>('#city-error')!
const initialState = document.querySelector<HTMLElement>('#initial-state')!
const weatherPanel = document.querySelector<HTMLElement>('#weather-panel')!
const loadingMessage = document.querySelector<HTMLElement>('#loading-message')!

let isLoading = false

const setLoadingState = (loading: boolean): void => {
  isLoading = loading
  searchButton.disabled = loading
  cityInput.disabled = loading
  loadingMessage.hidden = !loading
  initialState.hidden = loading
}

form.addEventListener('submit', (event) => {
  event.preventDefault()

  if (isLoading) {
    return
  }

  const query = cityInput.value.trim()
  cityError.textContent = ''
  cityInput.setAttribute('aria-invalid', 'false')

  if (query.length === 0) {
    cityError.textContent = 'Digite o nome de uma cidade.'
    cityInput.setAttribute('aria-invalid', 'true')
    cityInput.focus()
    return
  }

  cityInput.value = query
  weatherPanel.hidden = true
  setLoadingState(true)
})
