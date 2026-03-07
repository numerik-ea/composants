/**
 * MQBDatePicker
 * =============
 * Sélecteur de date (et de plage de dates) accessible, sans dépendance.
 *
 * UTILISATION
 * -----------
 * Une seule instance par déclencheur, deux modes d'initialisation :
 *
 *   // 1. Instance unique
 *   const picker = MQBDatePicker({
 *     trigger: '#mon-bouton',
 *     minDate: '01/06/2026',
 *     onConfirm({ startDate, endDate }) {
 *       console.log(startDate, endDate);
 *     },
 *   });
 *
 *   // 2. Plusieurs déclencheurs via un sélecteur CSS
 *   const pickers = MQBDatePicker.initAll('.mqb-trigger', {
 *     returnFormat: 'aaaa-mm-jj',
 *     onConfirm({ startDate }) { console.log(startDate); },
 *   });
 *
 *
 * OPTIONS
 * -------
 * Toutes les options sont facultatives.
 *
 * — Déclencheur —
 * trigger        {string|Element}
 *   Bouton qui ouvre le calendrier.
 *   Accepte un sélecteur CSS ('#id', '.classe') ou un élément DOM.
 *
 * — Callbacks —
 * onChange       {function}
 *   Appelé à chaque changement de sélection.
 *   Reçoit { startDate, endDate? } au format défini par returnFormat.
 *
 * onConfirm      {function}
 *   Appelé quand l'utilisateur confirme sa sélection (bouton « Choisir »).
 *   Reçoit { startDate, endDate? } au format défini par returnFormat.
 *
 * — Dates limites —
 * Acceptent un objet Date, une chaîne 'jj/mm/aaaa' ou 'aaaa-mm-jj'.
 *
 * minDate        {Date|string}   Première date sélectionnable. Défaut : aujourd'hui.
 * maxDate        {Date|string}   Dernière date sélectionnable. Défaut : aucune limite.
 *
 * — Format de retour —
 * returnFormat   {'date'|'jj/mm/aaaa'|'aaaa-mm-jj'|'json'}
 *   Format des valeurs reçues dans onChange, onConfirm et getValue().
 *   - 'date'          → objet Date natif (défaut)
 *   - 'jj/mm/aaaa'    → chaîne "04/03/2026"
 *   - 'aaaa-mm-jj'    → chaîne ISO "2026-03-04"
 *   - 'json'          → objet { day, month, year }
 *   La casse est ignorée.
 *
 * — Apparence —
 * color          {string}        Couleur principale CSS. Défaut : '#8B1535'.
 * zIndex         {number}        z-index de l'overlay. Défaut : 200.
 *                                À augmenter en cas de conflit avec d'autres couches.
 *
 * — Responsive —
 * breakpoint     {number}        Largeur (px) à partir de laquelle le calendrier
 *                                s'affiche en popover (desktop) plutôt qu'en modale
 *                                (mobile). Défaut : 768.
 *
 * — Formatage lecteur d'écran —
 * fmt            {function}      Fonction (Date) → string utilisée dans les annonces.
 *                                Défaut : d.toLocaleDateString('fr-FR', …).
 *                                Accessible aussi via MQBDatePicker.fmt.
 *
 *
 * API PUBLIQUE (instance)
 * -----------------------
 * picker.open()               Ouvre le calendrier (ou le ferme s'il est déjà ouvert).
 * picker.close()              Ferme le calendrier et replace le focus sur le déclencheur.
 * picker.clear()              Efface la sélection et vide les champs de saisie.
 * picker.getValue()           Retourne { startDate, endDate? } au format returnFormat.
 * picker.setValue(start, end) Définit la sélection par programme (sans déclencher
 *                             onChange/onConfirm). end est facultatif.
 * picker.destroy()            Supprime le composant du DOM et libère les écouteurs.
 *
 * API STATIQUE
 * ------------
 * MQBDatePicker.fmt           Fonction de formatage par défaut (fr-FR).
 * MQBDatePicker.initAll(sel, options)
 *                             Crée une instance par élément correspondant au sélecteur.
 *                             Retourne un tableau d'instances.
 *
 *
 * ACCESSIBILITÉ
 * -------------
 * - Dialogue ARIA (role="dialog", aria-modal en mode modale).
 * - Focus piégé dans la modale (Tab / Shift+Tab).
 * - Fermeture par Échap.
 * - Navigation clavier dans le calendrier : ←→↑↓, Début/Fin (semaine),
 *   Pg.Préc/Pg.Suiv (mois), Entrée/Espace (sélection).
 * - Ouverture : focus sur le bouton de fermeture (mobile) ou le champ
 *   de saisie de la date de début (desktop).
 * - Annonces live region pour les changements de mois et de sélection.
 * - Labels et messages d'erreur accessibles (aria-describedby, aria-invalid).
 */

(function (global) {
  'use strict';

  const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const BREAKPOINT = 768;

  // NVDA est exclusivement Windows ; VoiceOver (Mac/iOS) et TalkBack (Android)
  // ne bénéficient pas de role="application" — on l'active uniquement sur Windows.
  const _isWindows = /Win/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? '');

  let _cssInjected = false;
  let _counter = 0;

  // ── CSS ──────────────────────────────────────────────────────────────────
  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    const s = document.createElement('style');
    s.dataset.mqb = '';
    s.textContent = `
      .mqb-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: var(--mqb-z-index, 200);
      }
      .mqb-overlay.mqb-visible { display: block; }

      .mqb-overlay.mqb-mode-modal.mqb-visible {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.4);
      }
      .mqb-overlay.mqb-mode-modal .mqb-dialog-header { display: flex; }

      .mqb-overlay.mqb-mode-popover.mqb-visible { background: transparent; }
      .mqb-overlay.mqb-mode-popover .mqb-dialog { position: fixed; }
      .mqb-overlay.mqb-mode-popover .mqb-dialog-header { display: none; }

      .mqb-dialog {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        width: 340px;
        max-width: calc(100vw - 32px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      @media (max-width: 767px) {
        .mqb-overlay.mqb-mode-modal { align-items: flex-start; }
        .mqb-overlay.mqb-mode-modal .mqb-dialog {
          position: absolute;
          top: 0;
          width: 100%;
          max-width: 100%;
          border-radius: 0;
          box-shadow: none;
        }
      }

      .mqb-dialog-header {
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .mqb-dialog-title { font-size: 1.125rem; font-weight: 700; margin: 0; }

      .mqb-close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        color: #333;
        line-height: 1;
      }
      .mqb-close-btn:focus-visible { outline: 3px solid #0057a8; outline-offset: 2px; }

      .mqb-date-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }
      .mqb-date-field label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .mqb-date-field input {
        width: 100%;
        border: none;
        border-bottom: 2px solid #ccc;
        padding: 4px 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #111;
        background: transparent;
        outline: none;
      }
      .mqb-input-wrap { position: relative; }
      .mqb-fake-placeholder {
        position: absolute;
        left: 0; top: 0; height: 100%;
        display: flex; align-items: center;
        color: #bbb; font-size: 0.95rem; font-weight: 400;
        pointer-events: none; user-select: none;
      }
      .mqb-date-field input:focus { border-bottom-color: var(--mqb-brand, #8B1535); }
      .mqb-date-field input[aria-invalid="true"] { border-bottom-color: #c0392b; }

      .mqb-error-msg {
        display: none;
        font-size: 0.8rem;
        color: #c0392b;
        margin-top: 4px;
        font-weight: 600;
      }
      .mqb-error-msg.mqb-error-visible { display: block; }

      .mqb-month-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .mqb-nav-btn {
        background: none;
        border: none;
        font-size: 1.4rem;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
        color: #444;
        line-height: 1;
      }
      .mqb-nav-btn:focus-visible { outline: 3px solid #0057a8; outline-offset: 2px; }
      .mqb-nav-btn:disabled { color: #ccc; cursor: default; }

      .mqb-month-label {
        font-size: 1rem;
        font-weight: 700;
        padding: 2px 14px;
        color: #111;
      }

      .mqb-calendar { width: 100%; border-collapse: collapse; }
      .mqb-calendar th {
        font-size: 0.82rem;
        font-weight: 600;
        text-align: center;
        padding: 4px 0 8px;
        color: #333;
      }
      .mqb-calendar td {
        text-align: center;
        padding: 2px 0;
        position: relative;
      }

      .mqb-calendar td.mqb-range-cell::before {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 36px;
        background: var(--mqb-brand, #8B1535);
        left: 0; right: 0;
        z-index: 0;
      }
      .mqb-calendar td.mqb-range-start::before { left: 50%; }
      .mqb-calendar td.mqb-range-end::before   { right: 50%; }

      .mqb-day-btn {
        position: relative;
        z-index: 1;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid transparent;
        background: none;
        font-size: 0.95rem;
        cursor: pointer;
        color: #222;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s;
      }
      .mqb-day-btn:focus-visible { outline: 3px solid #0057a8; outline-offset: 2px; }
      .mqb-day-btn:hover:not(:disabled) { background: rgba(0,0,0,0.07); }
      .mqb-day-btn.mqb-outside-month { color: #bbb; }
      .mqb-day-btn.mqb-today { border-color: #333; }

      .mqb-calendar td.mqb-range-cell .mqb-day-btn:not(.mqb-selected-start):not(.mqb-selected-end) { color: #fff; }
      .mqb-calendar td.mqb-range-cell .mqb-day-btn:hover:not(:disabled):not(.mqb-selected-start):not(.mqb-selected-end) {
        background: rgba(255,255,255,0.15);
      }

      .mqb-day-btn.mqb-selected-start,
      .mqb-day-btn.mqb-selected-end {
        background: var(--mqb-brand, #8B1535) !important;
        color: #fff !important;
        border-color: var(--mqb-brand, #8B1535);
      }
      .mqb-day-btn:disabled { color: #ccc; cursor: default; }

      .mqb-dialog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
      }
      .mqb-clear-btn {
        background: none;
        border: none;
        font-size: 0.95rem;
        font-weight: 700;
        text-decoration: underline;
        cursor: pointer;
        padding: 4px;
        color: #222;
      }
      .mqb-clear-btn:focus-visible { outline: 3px solid #0057a8; outline-offset: 2px; }

      .mqb-confirm-btn {
        padding: 10px 22px;
        background: #ccc;
        border: none;
        border-radius: 24px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: default;
        color: #fff;
        transition: background 0.2s;
      }
      .mqb-confirm-btn.mqb-active { background: var(--mqb-brand, #8B1535); cursor: pointer; }
      .mqb-confirm-btn.mqb-active:focus-visible { outline: 3px solid #0057a8; outline-offset: 2px; }

      .mqb-sr-only {
        position: absolute;
        width: 1px; height: 1px;
        padding: 0; overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap; border: 0;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Utilitaire : normalisation de date ───────────────────────────────────
  function _parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) { const d = new Date(value); d.setHours(0, 0, 0, 0); return d; }
    if (typeof value === 'string') {
      let d;
      const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // jj/mm/aaaa
      if (dmy) d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
      else d = new Date(value); // aaaa-mm-jj (ISO natif)
      if (isNaN(d)) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  }

  // ── HTML template ────────────────────────────────────────────────────────
  function _buildHTML(id, exStart, exEnd) {
    const sid = `mqb-start-${id}`;
    const eid = `mqb-end-${id}`;
    const mlid = `mqb-month-label-${id}`;
    return `
      <div class="mqb-overlay" id="mqb-overlay-${id}" role="none">
        <div class="mqb-dialog" id="mqb-dialog-${id}" role="dialog" aria-labelledby="mqb-title-${id}">
          <div class="mqb-dialog-header">
            <h2 class="mqb-dialog-title" id="mqb-title-${id}">Choisir une date</h2>
            <button class="mqb-close-btn" id="mqb-close-${id}" aria-label="Fermer le sélecteur de date">&#x2715;</button>
          </div>
          <div class="mqb-date-fields">
            <div class="mqb-date-field">
              <label for="${sid}">Date de début<span class="mqb-sr-only">, format jj/mm/aaaa,</span><br><span aria-hidden="true">(ex : ${exStart})</span><span class="mqb-sr-only">exemple : ${exStart}</span></label>
              <div class="mqb-input-wrap">
                <input id="${sid}" type="text" inputmode="numeric"
                       autocomplete="off"
                       aria-invalid="false"
                       aria-describedby="${sid}-error">
                <span class="mqb-fake-placeholder" aria-hidden="true">jj/mm/aaaa</span>
              </div>
              <span id="${sid}-error" class="mqb-error-msg" role="alert"></span>
            </div>
            <div class="mqb-date-field">
              <label for="${eid}">
                Date de fin<span class="mqb-sr-only">, format jj/mm/aaaa, optionnel,</span> <span aria-hidden="true">(option)</span><br><span aria-hidden="true">(ex : ${exEnd})</span><span class="mqb-sr-only">exemple : ${exEnd}</span>
              </label>
              <div class="mqb-input-wrap">
                <input id="${eid}" type="text" inputmode="numeric"
                       autocomplete="off"
                       aria-invalid="false"
                       aria-describedby="${eid}-error">
                <span class="mqb-fake-placeholder" aria-hidden="true">jj/mm/aaaa</span>
              </div>
              <span id="${eid}-error" class="mqb-error-msg" role="alert"></span>
            </div>
          </div>
          <div${_isWindows ? ' role="application"' : ''}>
            <div class="mqb-month-nav">
              <button class="mqb-nav-btn" id="mqb-prev-${id}" aria-label="Mois précédent">&#8592;</button>
              <div id="${mlid}" class="mqb-month-label" aria-live="polite" aria-atomic="true"></div>
              <button class="mqb-nav-btn" id="mqb-next-${id}" aria-label="Mois suivant">&#8594;</button>
            </div>
            <table class="mqb-calendar" role="presentation">
              <thead>
                <tr>
                  <th scope="col" abbr="Lundi">Lun</th>
                  <th scope="col" abbr="Mardi">Mar</th>
                  <th scope="col" abbr="Mercredi">Mer</th>
                  <th scope="col" abbr="Jeudi">Jeu</th>
                  <th scope="col" abbr="Vendredi">Ven</th>
                  <th scope="col" abbr="Samedi">Sam</th>
                  <th scope="col" abbr="Dimanche">Dim</th>
                </tr>
              </thead>
              <tbody id="mqb-cal-body-${id}"></tbody>
            </table>
          </div>
          <div aria-live="polite" aria-atomic="true" class="mqb-sr-only" id="mqb-announce-${id}"></div>
          <div class="mqb-dialog-footer">
            <button class="mqb-clear-btn" id="mqb-clear-${id}">Effacer</button>
            <button class="mqb-confirm-btn" id="mqb-confirm-${id}" aria-disabled="true" disabled>Choisir cette date</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Classe principale ────────────────────────────────────────────────────
  class _MQBDatePicker {
    /**
     * Sélecteur de date accessible (modal sur mobile, popover sur desktop).
     *
     * @param {object} options
     *
     * — Déclencheur —
     * @param {string|Element} [options.trigger]
     *   Bouton qui ouvre le calendrier.
     *   Accepte un sélecteur CSS ('#id', '.classe') ou un élément DOM.
     *   Peut aussi être initialisé via MQBDatePicker.initAll('.classe').
     *
     * — Callbacks —
     * @param {function} [options.onChange]
     *   Appelé à chaque changement de sélection.
     *   Reçoit { startDate, endDate? } au format défini par returnFormat.
     *   endDate est absent si seule la date de début est sélectionnée.
     * @param {function} [options.onConfirm]
     *   Appelé quand l'utilisateur confirme sa sélection.
     *   Reçoit { startDate, endDate? } au format défini par returnFormat.
     *
     * — Apparence —
     * @param {string} [options.color='#8B1535']
     *   Couleur principale (boutons, plage de sélection). Toute valeur CSS valide.
     *
     * — Dates limites —
     * Acceptent : un objet Date, une chaîne 'jj/mm/aaaa',
     *             ou une chaîne ISO 'aaaa-mm-jj'.
     * @param {Date|string} [options.minDate]
     *   Première date sélectionnable. Défaut : aujourd'hui.
     *   Le calendrier s'ouvre sur ce mois si minDate est dans le futur.
     * @param {Date|string} [options.maxDate]
     *   Dernière date sélectionnable. Défaut : aucune limite.
     *
     * — Format de retour —
     * @param {'date'|'DATE'|'jj/mm/aaaa'|'JJ/MM/AAAA'|'aaaa-mm-jj'|'AAAA-MM-JJ'|'json'|'JSON'} [options.returnFormat='date']
     *   Format des valeurs reçues dans onChange, onConfirm et getValue().
     *   - 'date'       → objet Date natif (défaut)
     *   - 'jj/mm/aaaa' → chaîne "04/03/2026"
     *   - 'aaaa-mm-jj' → chaîne ISO "2026-03-04"
     *   - 'json'       → objet { day: number, month: number, year: number }
     *   La casse est ignorée ('DATE', 'Json', etc. sont acceptés).
     *
     * — Mise en page responsive —
     * @param {number} [options.breakpoint=768]
     *   Largeur en px à partir de laquelle le calendrier s'affiche
     *   en popover (desktop) plutôt qu'en modale plein écran (mobile).
     *
     * — Format d'affichage des dates —
     * @param {function} [options.fmt]
     *   Fonction de formatage utilisée dans les annonces lecteur d'écran.
     *   Défaut : d => d.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }).
     *   Accessible aussi via MQBDatePicker.fmt.
     */
    constructor(options = {}) {
      _counter++;
      this._id = _counter;
      this._opts = Object.assign({
        trigger: null, onConfirm: null, onChange: null, color: '#8B1535', minDate: null, maxDate: null, breakpoint: BREAKPOINT, returnFormat: 'date',
        fmt: _defaultFmt,
      }, options);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this._today = today;

      this._minDate = _parseDate(this._opts.minDate) ?? new Date(today);
      this._maxDate = _parseDate(this._opts.maxDate);

      this._viewYear = today.getFullYear();
      this._viewMonth = today.getMonth();
      this._startDate = null;
      this._endDate = null;
      this._focusedDate = new Date(today);
      this._currentMode = null;
      this._triggerEl = null;

      _injectCSS();
      this._createDOM();
      this._bindEvents();
    }

    _createDOM() {
      const id = this._id;
      const tpl = document.createElement('div');
      const pad = n => String(n).padStart(2, '0');
      const fmtEx = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const _todayEx = new Date(); _todayEx.setHours(0, 0, 0, 0);
      let exStartDate;
      if (this._opts.minDate) {
        const minD = this._minDate;
        const currentMonthStart = new Date(_todayEx.getFullYear(), _todayEx.getMonth(), 1);
        const minMonthStart = new Date(minD.getFullYear(), minD.getMonth(), 1);
        if (minMonthStart < currentMonthStart) {
          exStartDate = new Date(_todayEx.getFullYear(), _todayEx.getMonth(), 1);
        } else if (minMonthStart.getTime() === currentMonthStart.getTime()) {
          exStartDate = new Date(minD);
        } else {
          exStartDate = new Date(minD.getFullYear(), minD.getMonth(), 1);
        }
      } else {
        exStartDate = new Date(_todayEx);
      }
      const _lastDayOfExMonth = new Date(exStartDate.getFullYear(), exStartDate.getMonth() + 1, 0).getDate();
      const exEndDate = exStartDate.getDate() === _lastDayOfExMonth
        ? new Date(exStartDate.getFullYear(), exStartDate.getMonth() + 1, 1)
        : new Date(exStartDate.getFullYear(), exStartDate.getMonth() + 1, 0);
      const exStart = fmtEx(exStartDate);
      const exEnd = fmtEx(exEndDate);
      this._exStart = exStart;
      this._exEnd = exEnd;
      tpl.innerHTML = _buildHTML(id, exStart, exEnd);
      document.body.appendChild(tpl.firstElementChild);

      const liveEl = document.createElement('div');
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('aria-atomic', 'true');
      liveEl.className = 'mqb-sr-only';
      document.body.appendChild(liveEl);
      this._announceConfirm = liveEl;

      this._overlay = document.getElementById(`mqb-overlay-${id}`);
      this._dialog = document.getElementById(`mqb-dialog-${id}`);
      this._closeBtn = document.getElementById(`mqb-close-${id}`);
      this._prevBtn = document.getElementById(`mqb-prev-${id}`);
      this._nextBtn = document.getElementById(`mqb-next-${id}`);
      this._monthLabel = document.getElementById(`mqb-month-label-${id}`);
      this._calBody = document.getElementById(`mqb-cal-body-${id}`);
      this._clearBtn = document.getElementById(`mqb-clear-${id}`);
      this._confirmBtn = document.getElementById(`mqb-confirm-${id}`);
      this._startInput = document.getElementById(`mqb-start-${id}`);
      this._endInput = document.getElementById(`mqb-end-${id}`);
      this._startFakePH = this._startInput.nextElementSibling;
      this._endFakePH = this._endInput.nextElementSibling;
      this._announce = document.getElementById(`mqb-announce-${id}`);
      this._startError = document.getElementById(`mqb-start-${id}-error`);
      this._endError = document.getElementById(`mqb-end-${id}-error`);

      this._dialog.style.setProperty('--mqb-brand', this._opts.color);
      if (this._opts.zIndex != null) this._overlay.style.setProperty('--mqb-z-index', this._opts.zIndex);

      if (this._opts.trigger) {
        const el = typeof this._opts.trigger === 'string'
          ? document.querySelector(this._opts.trigger)
          : this._opts.trigger;
        if (el) {
          this._triggerEl = el;
          el.setAttribute('aria-haspopup', 'dialog');
          el.setAttribute('aria-expanded', 'false');
          el.addEventListener('click', () => this.open());
          // Sur Windows/NVDA : envelopper le déclencheur dans role="application"
          // pour éviter la double lecture Browse mode → Focus mode.
          if (_isWindows) {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('role', 'application');
            wrapper.setAttribute('aria-label', el.textContent.trim());
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
          }
        }
      }
    }

    _bindEvents() {
      this._closeBtn.addEventListener('click', () => this.close());

      this._overlay.addEventListener('click', e => {
        if (e.target === this._overlay) this.close();
      });

      this._prevBtn.addEventListener('click', () => {
        if (this._prevBtn.disabled) return;
        if (this._viewMonth === 0) { this._viewMonth = 11; this._viewYear--; }
        else this._viewMonth--;
        const firstOfMonth = new Date(this._viewYear, this._viewMonth, 1);
        this._focusedDate = firstOfMonth >= this._minDate ? firstOfMonth : new Date(this._minDate);
        this._render();
        requestAnimationFrame(() => this._calBody.querySelector('[tabindex="0"]')?.focus());
      });

      this._nextBtn.addEventListener('click', () => {
        if (this._viewMonth === 11) { this._viewMonth = 0; this._viewYear++; }
        else this._viewMonth++;
        this._focusedDate = new Date(this._viewYear, this._viewMonth, 1);
        this._render();
        requestAnimationFrame(() => this._calBody.querySelector('[tabindex="0"]')?.focus());
      });

      this._clearBtn.addEventListener('click', () => this.clear());

      this._confirmBtn.addEventListener('click', () => {
        if (!this._startDate) return;
        if (typeof this._opts.onConfirm === 'function') {
          this._opts.onConfirm(this._buildReturnValue());
        }
        const fmtLong = d => {
          const day = DAYS_FR[(d.getDay() + 6) % 7];
          const num = String(d.getDate()).padStart(2, '0');
          const month = MONTHS_FR[d.getMonth()].toLowerCase();
          return `${day} ${num} ${month} ${d.getFullYear()}`;
        };
        this._announceConfirm.textContent = this._endDate
          ? `du ${fmtLong(this._startDate)} au ${fmtLong(this._endDate)} période sélectionnée`
          : `${fmtLong(this._startDate)} date sélectionnée`;
        this.close({ silent: true });
      });

      this._wireInput(this._startInput, true);
      this._wireInput(this._endInput, false);

      this._onResize = () => { if (this._overlay.classList.contains('mqb-visible')) this.close(); };
      this._onEsc = e => { if (e.key === 'Escape') this.close(); };
      this._trapFocus = e => {
        if (e.key !== 'Tab') return;
        const focusable = [...this._dialog.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')]
          .filter(el => el.offsetParent !== null);
        const first = focusable[0];
        const last = focusable.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };

      window.addEventListener('resize', this._onResize);
    }

    _wireInput(input, isStart) {
      let _prev = '';
      input.addEventListener('input', () => {
        const isDeleting = input.value.length < _prev.length;
        let v = input.value.replace(/\D/g, '');

        if (v.length > 2) {
          v = v.slice(0, 2) + '/' + v.slice(2);
        } else if (v.length === 2 && !isDeleting) {
          v = v + '/';
        }

        if (v.length > 5) {
          v = v.slice(0, 5) + '/' + v.slice(5);
        } else if (v.length === 5 && !isDeleting) {
          v = v + '/';
        }

        if (v.length > 10) v = v.slice(0, 10);
        _prev = v;
        input.value = v;
        const fakePH = isStart ? this._startFakePH : this._endFakePH;
        fakePH.style.display = v ? 'none' : '';
      });
      const errorEl = isStart ? this._startError : this._endError;

      const validate = (d, value) => {
        if (!value) return '';
        if (!d) return `Format invalide<br><span aria-hidden="true">(ex : ${isStart ? this._exStart : this._exEnd})</span><span class="mqb-sr-only">, exemple : ${isStart ? this._exStart : this._exEnd}</span>`;
        if (d < this._minDate) return 'La date ne peut pas être dans le passé';
        if (this._maxDate && d > this._maxDate) return 'La date dépasse la date maximale autorisée';
        return '';
      };


      input.addEventListener('blur', () => {
        const d = this._parseInput(input.value);
        this._setError(input, errorEl, validate(d, input.value));
      });

      input.addEventListener('change', () => {
        const d = this._parseInput(input.value);
        const error = validate(d, input.value);
        this._setError(input, errorEl, error);
        const validDate = error ? null : d;
        if (isStart) {
          this._startDate = validDate;
          if (validDate) { this._viewYear = validDate.getFullYear(); this._viewMonth = validDate.getMonth(); }
        } else {
          this._endDate = validDate;
        }
        this._render();
        if (typeof this._opts.onChange === 'function') {
          this._opts.onChange(this._buildReturnValue());
        }
      });
    }

    _setError(input, errorEl, message) {
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        errorEl.innerHTML = message;
        errorEl.classList.add('mqb-error-visible');
      } else {
        input.setAttribute('aria-invalid', 'false');
        errorEl.textContent = '';
        errorEl.classList.remove('mqb-error-visible');
      }
    }

    _buildReturnValue() {
      const result = { startDate: this._formatReturn(this._startDate) };
      if (this._endDate) result.endDate = this._formatReturn(this._endDate);
      return result;
    }

    _formatReturn(d) {
      if (!d) return null;
      const fmt = (this._opts.returnFormat || 'date').toLowerCase();
      if (fmt === 'jj/mm/aaaa') return this._formatDate(d);
      if (fmt === 'aaaa-mm-jj') return this._toLocalISO(d);
      if (fmt === 'json') return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
      return d; // 'date' → Date object
    }

    // ── Utilitaires ───────────────────────────────────────────────────────
    _sameDay(a, b) {
      return a && b
        && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
    }

    _formatDate(d) {
      if (!d) return '';
      return [String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear()].join('/');
    }

    _toLocalISO(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    _parseInput(str) {
      const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) return null;
      const day = +m[1], month = +m[2], year = +m[3];
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      const d = new Date(year, month - 1, day);
      if (isNaN(d)) return null;
      // Rejet des débordements JS (ex: 30/02 → 02/03, 77/77 → date aléatoire)
      if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    }

    // ── Rendu ─────────────────────────────────────────────────────────────
    _render() {
      const { _viewMonth: vm, _viewYear: vy, _today, _minDate, _maxDate, _startDate, _endDate, _focusedDate } = this;

      this._monthLabel.textContent = `${MONTHS_FR[vm]} ${vy}`;

      const prevM = vm === 0 ? 11 : vm - 1;
      const prevY = vm === 0 ? vy - 1 : vy;
      const nextM = vm === 11 ? 0 : vm + 1;
      const nextY = vm === 11 ? vy + 1 : vy;
      this._prevBtn.setAttribute('aria-label', `Mois précédent ${MONTHS_FR[prevM]} ${prevY}`);
      this._nextBtn.setAttribute('aria-label', `Mois suivant ${MONTHS_FR[nextM]} ${nextY}`);

      const minMonth = new Date(_minDate.getFullYear(), _minDate.getMonth(), 1).getTime();
      const currMonth = new Date(vy, vm, 1).getTime();
      this._prevBtn.disabled = currMonth <= minMonth;

      const maxMonth = _maxDate ? new Date(_maxDate.getFullYear(), _maxDate.getMonth(), 1).getTime() : null;
      this._nextBtn.disabled = maxMonth !== null && currMonth >= maxMonth;

      const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
      const daysInMonth = new Date(vy, vm + 1, 0).getDate();
      const prevDays = new Date(vy, vm, 0).getDate();
      const hasRange = _startDate && _endDate && !this._sameDay(_startDate, _endDate);

      let html = '';
      let dayCount = 1, afterCount = 1;

      for (let row = 0; row < 6; row++) {
        html += '<tr>';
        for (let col = 0; col < 7; col++) {
          const idx = row * 7 + col;
          let d, outside = false;

          if (idx < firstDow) {
            d = new Date(vy, vm - 1, prevDays - firstDow + idx + 1);
            outside = true;
          } else if (dayCount > daysInMonth) {
            d = new Date(vy, vm + 1, afterCount++);
            outside = true;
          } else {
            d = new Date(vy, vm, dayCount++);
          }

          const isToday = this._sameDay(d, _today);
          const isPast = d < _minDate;
          const isAfterMax = _maxDate && d > _maxDate;
          const isSelStart = !outside && this._sameDay(d, _startDate);
          const isSelEnd = !outside && !!_endDate && this._sameDay(d, _endDate);
          const isRangeStart = hasRange && !outside && this._sameDay(d, _startDate);
          const isRangeEnd = hasRange && !outside && this._sameDay(d, _endDate);
          const isRangeMiddle = hasRange && !outside && d > _startDate && d < _endDate;
          const isRangeCell = isRangeStart || isRangeEnd || isRangeMiddle;
          const isFocused = this._sameDay(d, _focusedDate);

          const tdCls = [
            isRangeCell ? 'mqb-range-cell' : '',
            isRangeStart ? 'mqb-range-start' : '',
            isRangeEnd ? 'mqb-range-end' : '',
          ].filter(Boolean).join(' ');

          const btnCls = [
            'mqb-day-btn',
            outside ? 'mqb-outside-month' : '',
            isToday ? 'mqb-today' : '',
            isSelStart ? 'mqb-selected-start' : '',
            isSelEnd ? 'mqb-selected-end' : '',
          ].filter(Boolean).join(' ');

          const isAfterStart = !outside && !!_startDate && !_endDate && d > _startDate;
          const isBeforeStart = !outside && !!_startDate && (
            _endDate ? (!isSelStart && !isSelEnd) : d < _startDate
          );

          const ariaLabel = `${DAYS_FR[col]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
            + (isToday ? ", aujourd'hui" : '')
            + (isSelStart ? ', date de début sélectionnée' : '')
            + (isSelEnd ? ', date de fin sélectionnée' : '')
            + (!isSelEnd && isAfterStart ? ', sélectionner la date de fin' : '')
            + (isBeforeStart ? ', modifier la date de début' : '');

          const disabled = outside || isPast || isAfterMax ? 'disabled' : '';

          html += `<td class="${tdCls}">
            <button class="${btnCls}"
              data-date="${this._toLocalISO(d)}"
              aria-label="${ariaLabel}"
              aria-pressed="${isSelStart || isSelEnd ? 'true' : 'false'}"
              tabindex="${isFocused ? '0' : '-1'}"
              ${disabled}
            >${d.getDate()}</button>
          </td>`;
        }
        html += '</tr>';
        if (row === 4 && dayCount > daysInMonth) break;
      }

      this._calBody.innerHTML = html;
      this._calBody.querySelectorAll('.mqb-day-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => this._selectDay(btn));
        btn.addEventListener('keydown', e => this._handleCalKeydown(e));
      });

      const fmtLong = d => {
        const day = DAYS_FR[(d.getDay() + 6) % 7];
        const num = String(d.getDate()).padStart(2, '0');
        const month = MONTHS_FR[d.getMonth()].toLowerCase();
        return `${day} ${num} ${month} ${d.getFullYear()}`;
      };

      if (_startDate) {
        this._confirmBtn.disabled = false;
        this._confirmBtn.removeAttribute('aria-disabled');
        this._confirmBtn.classList.add('mqb-active');
        if (_endDate) {
          this._confirmBtn.textContent = 'Choisir cette période';
          this._confirmBtn.setAttribute('aria-label', `du ${fmtLong(_startDate)} au ${fmtLong(_endDate)} Choisir cette période`);
        } else {
          this._confirmBtn.textContent = 'Choisir cette date';
          this._confirmBtn.setAttribute('aria-label', `${fmtLong(_startDate)} Choisir cette date`);
        }
      } else {
        this._confirmBtn.disabled = true;
        this._confirmBtn.setAttribute('aria-disabled', 'true');
        this._confirmBtn.classList.remove('mqb-active');
        this._confirmBtn.textContent = 'Choisir cette date';
        this._confirmBtn.removeAttribute('aria-label');
      }

      if (document.activeElement !== this._startInput && this._startInput.getAttribute('aria-invalid') !== 'true') {
        this._startInput.value = this._formatDate(_startDate);
        this._startFakePH.style.display = this._startInput.value ? 'none' : '';
      }
      if (document.activeElement !== this._endInput && this._endInput.getAttribute('aria-invalid') !== 'true') {
        this._endInput.value = this._formatDate(_endDate);
        this._endFakePH.style.display = this._endInput.value ? 'none' : '';
      }

    }

    // ── Sélection ─────────────────────────────────────────────────────────
    _selectDay(btn) {
      const d = new Date(btn.dataset.date + 'T00:00:00');

      if (!this._startDate || (this._startDate && this._endDate)) {
        this._startDate = d;
        this._endDate = null;
      } else {
        if (d < this._startDate) {
          this._endDate = this._startDate;
          this._startDate = d;
        } else if (this._sameDay(d, this._startDate)) {
          this._startDate = null;
        } else {
          this._endDate = d;
        }
      }

      this._startInput.value = this._formatDate(this._startDate);
      this._endInput.value = this._formatDate(this._endDate);
      this._setError(this._startInput, this._startError, '');
      this._setError(this._endInput, this._endError, '');

      this._focusedDate = d;
      const fmtLong = d => {
        const day = DAYS_FR[(d.getDay() + 6) % 7];
        const num = String(d.getDate()).padStart(2, '0');
        const month = MONTHS_FR[d.getMonth()].toLowerCase();
        return `${day} ${num} ${month} ${d.getFullYear()}`;
      };
      this._announce.textContent = this._startDate && this._endDate
        ? `Date de début ${fmtLong(this._startDate)}, date de fin ${fmtLong(this._endDate)}`
        : this._startDate
          ? `Date de début sélectionnée ${fmtLong(this._startDate)}`
          : 'Sélection effacée.';

      this._render();
      setTimeout(() => this._calBody.querySelector('[tabindex="0"]')?.focus(), 0);

      if (typeof this._opts.onChange === 'function') {
        this._opts.onChange(this._buildReturnValue());
      }
    }

    // ── Navigation clavier dans la grille ─────────────────────────────────
    _handleCalKeydown(e) {
      const HANDLED = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', ' '];
      if (!HANDLED.includes(e.key)) return;
      e.preventDefault();

      if (e.key === 'Enter' || e.key === ' ') {
        this._selectDay(e.currentTarget);
        return;
      }

      let next = new Date(this._focusedDate);
      switch (e.key) {
        case 'ArrowLeft': next.setDate(next.getDate() - 1); break;
        case 'ArrowRight': next.setDate(next.getDate() + 1); break;
        case 'ArrowUp': next.setDate(next.getDate() - 7); break;
        case 'ArrowDown': next.setDate(next.getDate() + 7); break;
        case 'Home': next.setDate(next.getDate() - (next.getDay() + 6) % 7); break;
        case 'End': next.setDate(next.getDate() + (6 - (next.getDay() + 6) % 7)); break;
        case 'PageUp': next.setMonth(next.getMonth() - 1); break;
        case 'PageDown': next.setMonth(next.getMonth() + 1); break;
      }

      if (next < this._minDate) return;
      if (this._maxDate && next > this._maxDate) return;
      this._focusedDate = next;
      this._viewYear = next.getFullYear();
      this._viewMonth = next.getMonth();
      this._render();
      this._calBody.querySelector('[tabindex="0"]')?.focus();
    }

    // ── Ouverture ─────────────────────────────────────────────────────────
    _openAsModal() {
      this._currentMode = 'modal';
      this._overlay.classList.add('mqb-mode-modal');
      this._dialog.setAttribute('aria-modal', 'true');

      // TalkBack (Android) ignore aria-modal : on masque explicitement les siblings
      this._hiddenSiblings = [...document.body.children]
        .filter(el => el !== this._overlay && !el.hasAttribute('aria-hidden'));
      this._hiddenSiblings.forEach(el => el.setAttribute('aria-hidden', 'true'));

      requestAnimationFrame(() => {
        this._closeBtn.focus();
      });
      document.addEventListener('keydown', this._trapFocus);
      document.addEventListener('keydown', this._onEsc);
    }

    _openAsPopover() {
      this._currentMode = 'popover';
      this._overlay.classList.add('mqb-mode-popover');
      this._dialog.removeAttribute('aria-modal');

      if (this._triggerEl) {
        const rect = this._triggerEl.getBoundingClientRect();
        const dialogW = 340;
        let left = rect.left;
        if (left + dialogW > window.innerWidth - 16) left = window.innerWidth - dialogW - 16;
        left = Math.max(16, left);
        this._dialog.style.top = `${rect.bottom + 8}px`;
        this._dialog.style.left = `${left}px`;
      }

      requestAnimationFrame(() => {
        this._startInput.focus();
      });
      document.addEventListener('keydown', this._onEsc);
    }

    // ── API publique ──────────────────────────────────────────────────────
    /**
     * Ouvre le calendrier. Si déjà ouvert, le ferme (toggle).
     * S'affiche en modale (mobile) ou en popover ancré au déclencheur (desktop)
     * selon options.breakpoint.
     */
    open() {
      if (this._overlay.classList.contains('mqb-visible')) { this.close(); return; }

      const ref = this._startDate ?? (this._minDate > this._today ? this._minDate : this._today);
      this._viewYear = ref.getFullYear();
      this._viewMonth = ref.getMonth();
      this._focusedDate = new Date(ref);
      this._render();

      if (this._triggerEl) this._triggerEl.setAttribute('aria-expanded', 'true');
      this._overlay.classList.add('mqb-visible');

      if (window.innerWidth >= this._opts.breakpoint) {
        this._openAsPopover();
      } else {
        this._openAsModal();
      }
    }

    /**
     * Ferme le calendrier et replace le focus sur le déclencheur.
     * @param {{ silent?: boolean }} [opts] silent=true évite que les AT annoncent le bouton déclencheur.
     */
    close({ silent = false } = {}) {
      this._overlay.classList.remove('mqb-visible', 'mqb-mode-modal', 'mqb-mode-popover');
      if (this._triggerEl) this._triggerEl.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', this._onEsc);
      document.removeEventListener('keydown', this._trapFocus);
      this._dialog.removeAttribute('aria-modal');

      // Restore siblings masqués pour TalkBack
      if (this._hiddenSiblings) {
        this._hiddenSiblings.forEach(el => el.removeAttribute('aria-hidden'));
        this._hiddenSiblings = null;
      }
      this._dialog.style.top = '';
      this._dialog.style.left = '';
      this._currentMode = null;
      if (this._triggerEl && !silent) {
        this._triggerEl.focus();
      }
    }

    /**
     * Efface la sélection et repositionne le calendrier sur le mois de minDate
     * (ou le mois courant si minDate est dans le passé).
     * Déclenche onChange({ startDate: null }).
     */
    clear() {
      this._startDate = this._endDate = null;
      this._startInput.value = '';
      this._endInput.value = '';
      this._setError(this._startInput, this._startError, '');
      this._setError(this._endInput, this._endError, '');
      const base = this._minDate > this._today ? this._minDate : this._today;
      this._focusedDate = new Date(base);
      this._viewYear = base.getFullYear();
      this._viewMonth = base.getMonth();
      this._announce.textContent = 'Dates effacées.';
      this._render();
      if (typeof this._opts.onChange === 'function') {
        this._opts.onChange({ startDate: null });
      }
    }

    /**
     * Retourne la sélection courante au format défini par options.returnFormat.
     * @returns {{ startDate, endDate? }}
     *   endDate est absent si seule la date de début est sélectionnée.
     */
    getValue() {
      return this._buildReturnValue();
    }

    /**
     * Définit la sélection par programme (ne déclenche pas onChange/onConfirm).
     * @param {Date|string|null} start  Date de début (formats : Date, 'jj/mm/aaaa', 'aaaa-mm-jj')
     * @param {Date|string|null} [end]  Date de fin (optionnelle)
     */
    setValue(start, end = null) {
      this._startDate = start ? new Date(start) : null;
      this._endDate = end ? new Date(end) : null;
      if (this._startDate) this._startDate.setHours(0, 0, 0, 0);
      if (this._endDate) this._endDate.setHours(0, 0, 0, 0);
      this._render();
    }

    /**
     * Supprime le composant du DOM et libère tous les écouteurs d'événements.
     * L'instance ne doit plus être utilisée après cet appel.
     */
    destroy() {
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('keydown', this._trapFocus);
      document.removeEventListener('keydown', this._onEsc);
      this._overlay.remove();
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────
  const _defaultFmt = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  /**
   * Crée une instance MQBDatePicker.
   *
   * @param {object} options  Voir la documentation de _MQBDatePicker pour la liste complète.
   * @returns {_MQBDatePicker}
   *
   * @example
   * const picker = MQBDatePicker({
   *   trigger: '#mon-bouton',
   *   minDate: '01/06/2026',
   *   maxDate: '31/12/2026',
   *   returnFormat: 'jj/mm/aaaa',
   *   onConfirm({ startDate, endDate }) {
   *     console.log(startDate, endDate);
   *   },
   * });
   */
  function MQBDatePicker(options) {
    return new _MQBDatePicker(options);
  }

  /**
   * Fonction de formatage par défaut utilisée pour les annonces lecteur d'écran.
   * Peut être passée directement à options.fmt ou réutilisée dans les callbacks.
   * @type {function(Date): string}
   * @example
   * const fmt = MQBDatePicker.fmt;
   * fmt(new Date(2026, 2, 4)); // "04 mars 2026"
   */
  MQBDatePicker.fmt = _defaultFmt;

  /**
   * Initialise une instance par élément correspondant au sélecteur CSS.
   * Utile pour activer le calendrier via une classe plutôt qu'un id.
   *
   * @param {string} selector  Sélecteur CSS (ex : '.mqb-trigger')
   * @param {object} [options] Options partagées entre toutes les instances
   * @returns {_MQBDatePicker[]}
   *
   * @example
   * MQBDatePicker.initAll('.mqb-trigger', {
   *   returnFormat: 'aaaa-mm-jj',
   *   onConfirm({ startDate }) { console.log(startDate); },
   * });
   */
  MQBDatePicker.initAll = function (selector, options = {}) {
    return [...document.querySelectorAll(selector)].map(el =>
      new _MQBDatePicker({ ...options, trigger: el })
    );
  };

  global.MQBDatePicker = MQBDatePicker;

}(typeof window !== 'undefined' ? window : this));
