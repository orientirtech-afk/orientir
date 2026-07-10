(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))c(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&c(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();function n(){document.addEventListener("DOMContentLoaded",()=>{const o=window.location.pathname;document.querySelectorAll(".nav-sphere").forEach(e=>{const t=e.getAttribute("href")||"";(o===t||o.endsWith(t)||t==="/index.html"&&(o==="/"||o.endsWith("/index.html"))||t==="/pages/index.html"&&(o==="/"||o.endsWith("/index.html")))&&e.classList.add("active")}),document.querySelectorAll(".footer-project").forEach(e=>{const t=e.getAttribute("href")||"";(o===t||o.endsWith(t))&&e.classList.add("active")})})}n();class l{constructor(){this.modal=null,this.init()}init(){this.modal=document.createElement("div"),this.modal.className="bottom-sheet privacy-modal",this.modal.id="privacy-modal",this.modal.setAttribute("role","dialog"),this.modal.setAttribute("aria-modal","true"),this.modal.setAttribute("aria-labelledby","privacy-modal-title"),this.modal.innerHTML=`
      <div class="sheet-overlay" data-privacy-close></div>
      <div class="sheet-container">
        <div class="sheet-header">
          <h3 id="privacy-modal-title">🔒 Принципы приватности</h3>
          <button class="sheet-close" data-privacy-close aria-label="Закрыть">×</button>
        </div>
        <div class="sheet-content privacy-content">
          <p class="privacy-lead">Проект «Ориентир» спроектирован с прицелом на максимальную приватность пользователя. Ниже — конкретные технические обязательства, которые соблюдаются на всех страницах сайта.</p>

          <div class="privacy-section">
            <h4>1. Персональные данные</h4>
            <p>Сайт не запрашивает и не передаёт третьим лицам персональные данные: имя, email, телефон, геолокацию, IP-адрес в привязке к личности. Контактный адрес <code>orientir.tech@gmail.com</code> используется только при вашей явной инициативе написать.</p>
          </div>

          <div class="privacy-section">
            <h4>2. Cookies и трекеры</h4>
            <p>Сайт не использует cookies для отслеживания, не подключает Google Analytics, Яндекс.Метрику, Facebook Pixel или аналогичные трекеры. На страницах нет пикселей отслеживания и fingerprinting-скриптов.</p>
          </div>

          <div class="privacy-section">
            <h4>3. Локальные данные</h4>
            <p>Все ваши конфигурации (выбранные уровни защиты, библиотека исследовательских элементов, креативный архетип) сохраняются <strong>только</strong> в <code>localStorage</code> вашего браузера. Они никогда не покидают устройство. Вы можете очистить их в любой момент через кнопку ниже или через DevTools браузера.</p>
            <button class="btn btn-secondary" id="privacy-clear-local" type="button">
              <span aria-hidden="true">🗑️</span> Очистить мои локальные данные
            </button>
          </div>

          <div class="privacy-section">
            <h4>4. Внешние ресурсы</h4>
            <p>Для работы 3D-сцен используется библиотека Three.js. Шрифты Manrope и JetBrains Mono размещены на собственном сервере (self-host). Внешний трафик минимизирован: только то, без чего сайт не будет работать. Заголовок <code>Content-Security-Policy</code> запрещает загрузку скриптов из произвольных источников.</p>
          </div>

          <div class="privacy-section">
            <h4>5. Вычисления</h4>
            <p>Все инструменты — анализатор манипуляций, конструктор RAG, конструктор методологии — работают полностью в вашем браузере. Текст, который вы вставляете в анализатор, не отправляется на сервер. Единственный сетевой запрос при работе инструментов — это статические файлы (CSS, JS, шрифты) при первой загрузке.</p>
          </div>

          <div class="privacy-section">
            <h4>6. Логирование</h4>
            <p>Серверные логи nginx содержат только стандартные метаданные HTTP-запросов (время, URL, статус, User-Agent). Они используются исключительно для диагностики и защиты от злоупотреблений, не передаются третьим лицам и автоматически ротируются.</p>
          </div>

          <p class="privacy-foot">Принципы обновлены: июль 2026. Если у вас есть вопросы о приватности — напишите на <a href="mailto:orientir.tech@gmail.com">orientir.tech@gmail.com</a>.</p>
        </div>
      </div>
    `,document.body.appendChild(this.modal),this.modal.querySelectorAll("[data-privacy-close]").forEach(t=>{t.addEventListener("click",c=>{c.preventDefault(),this.close()})}),document.addEventListener("keydown",t=>{t.key==="Escape"&&this.modal.classList.contains("active")&&this.close()});const e=this.modal.querySelector("#privacy-clear-local");e&&e.addEventListener("click",()=>this.clearLocalData()),document.addEventListener("orientir:open-privacy-modal",()=>this.open()),this.bindTriggers(),this.bindLicenseBtn()}bindTriggers(){document.querySelectorAll("#privacy-policy-btn").forEach(e=>{e._privacyBound||(e._privacyBound=!0,e.addEventListener("click",t=>{t.preventDefault(),this.open()}))})}bindLicenseBtn(){document.querySelectorAll("#license-btn").forEach(e=>{e._licenseBound||(e._licenseBound=!0,e.addEventListener("click",t=>{t.preventDefault(),this.open()}))})}open(){if(!this.modal)return;this.modal.classList.add("active"),document.body.style.overflow="hidden";const e=this.modal.querySelector(".sheet-close");e&&setTimeout(()=>e.focus(),100)}close(){this.modal&&(this.modal.classList.remove("active"),document.body.style.overflow="")}clearLocalData(){const e=["lab_library_elements","lab_methodology_v2","ai_protection_config_v2","creative-archetype"];let t=0;for(const c of e)localStorage.getItem(c)&&(localStorage.removeItem(c),t++);if(t>0)window.location.reload();else{const c=new CustomEvent("orientir:notification",{detail:{message:"Локальные данные уже пусты",type:"info"}});document.dispatchEvent(c)}}}let a=null;document.addEventListener("DOMContentLoaded",()=>{a?a.bindTriggers():a=new l});function d(){"serviceWorker"in navigator&&(location.protocol!=="https:"&&location.hostname!=="localhost"||window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(o=>{void 0}).catch(o=>{console.warn("[SW] Ошибка регистрации:",o)})}))}d();
