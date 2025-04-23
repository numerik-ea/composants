import { initMap, updateMarkers, setMapHeight } from './map.js';
import { createJobList } from './joblist.js';

document.addEventListener('DOMContentLoaded', function () {
  // Bind the modal before the list is creater
  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach(item => {
    item.addEventListener('click', () => {
      event.preventDefault();
      openModal(event.currentTarget.dataset.jobdescurl);
    });
  });

  // Init the map before the list is created
  const mapdivid = 'map';
  const { map, myIcons, clusterGroup } = initMap(mapdivid);

  // Create the list
  const jobList = createJobList();

  // Add an event listener to your search field
  document.getElementById('s').addEventListener('input', function (event) {
    jobList.search(event.target.value);
  });

  const jobCounter = document.getElementById("job-counter");
  let actualTitle = '';
  let actualApply_url = '';
  let refreshSuspended = true;
  // Set the modal Close Behavior once
  const jobDescModal = document.getElementById('jobdesc-modal');
  const jobDescModalContent = document.getElementById('jobdesc-modal-content');
  const jobDescContainer = document.getElementById('jobdesc-container');

  jobDescModal.addEventListener('click', function (event) {
    if (!jobDescModalContent.contains(event.target)) {
      closeModal();
    }
  });
  document.getElementById('closeModal').addEventListener('click', () => { closeModal(); });

  // Get the select elements
  const categorieSelect = document.getElementById('custom_categorie_metier-field');
  const contractSelect = document.getElementById('contracttype-field');
  const timeSelect = document.getElementById('custom_temps_de_travail-field');
  const filiereCheckboxes = document.querySelectorAll('input[name="custom_filiere_metier[]"]');
  const FILIERE = [
    "Livraison à domicile",
    "Magasins",
    "Fonctions supports"
  ];

  // Add event listeners to the select elements
  categorieSelect.addEventListener('change', filter_list);
  contractSelect.addEventListener('change', filter_list);
  timeSelect.addEventListener('change', filter_list);
  filiereCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filter_list);
    checkbox.addEventListener('click', (event) => {
      event.target.parentNode.classList.toggle('active');
    });
  });

  function filter_list() {
    const categorieValue = categorieSelect.value;
    const contractValue = contractSelect.value;
    const timeValue = timeSelect.value;
    const selectedFiliereValues = Array.from(filiereCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => FILIERE[parseInt(checkbox.value) - 1]);
    const bounds = map.getBounds();

    jobList.filter(item => {
      const latLng = L.latLng(item.values().latitude, item.values().longitude);
      return (bounds.contains(latLng) && (contractValue === '0' || item.values().contract_type === contractSelect.options[contractSelect.selectedIndex].textContent) && (categorieValue === '0' || item.values().custom_categorie_metier === categorieSelect.options[categorieSelect.selectedIndex].textContent) && (timeValue === '0' || item.values().custom_temps_de_travail === timeSelect.options[timeSelect.selectedIndex].textContent) && (selectedFiliereValues.length === 0 || selectedFiliereValues.includes(item.values().custom_filiere_metier)));
    });
  }

  // Vérifier s'il y a des paramètres d'URL préremplis
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const metierId = urlParams.get('metierid');

  // Préremplir les champs de filtrage si des paramètres sont présents dans l'URL
  if (searchQuery) {
    document.getElementById('s').value = searchQuery;
    document.getElementById('s').dispatchEvent(new Event('input'));
  }
  if (metierId) {
    document.getElementById('custom_categorie_metier-field').value = metierId;
  }

  // Ajouter un événement de recherche aux champs de filtrage
  document.getElementById('s').addEventListener('input', filter_list);
  document.getElementById('custom_categorie_metier-field').addEventListener('change', filter_list);
  document.getElementById('contracttype-field').addEventListener('change', filter_list);
  document.getElementById('custom_temps_de_travail-field').addEventListener('change', filter_list);

  function formatDate(dateString) {
    // création d'un objet Date à partir de la chaîne de caractères
    const date = new Date(dateString);

    // création d'un objet Intl.DateTimeFormat pour formater la date
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    // formatage de la date en utilisant l'objet DateFormatter
    const formattedDate = 'Publié le ' + dateFormatter.format(date);

    return formattedDate;
  }

  jobList.on('updated', function () {
    updateMarkers(clusterGroup, map, myIcons, jobList.matchingItems);
    if (jobCounter) {
      jobCounter.innerHTML = jobList.matchingItems.length;
    }
    refreshSuspended = false;

  });

  jobList.update();

  // Susprendre le refresh de la map sur  spiderfication et popup
  clusterGroup.on('spiderfied', () => {
    refreshSuspended = true;
  });
  clusterGroup.on('unspiderfied', () => {
    refreshSuspended = false;
  });
  map.on('popupopen', async function (event) {
    refreshSuspended = true;

    const showDescBtn = event.popup._contentNode.querySelector('.showjobdesc-btn');

    showDescBtn.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(event.currentTarget.href);
    });
  });

  map.on('popupclose', () => {
    refreshSuspended = false;
  });

  // Add an event listener to the map's moveend event to filter the list based on the visible markers
  map.on('moveend', function () {
    if (!refreshSuspended) {
      filter_list();
    }
  });

  async function openModal(url) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const content = doc.querySelector('.job-description');

      if (content) {
        jobDescContainer.innerHTML = content.innerHTML;
        jobDescModal.style.display = 'block';
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu de l\'article:', error);
    }
  };

  function closeModal() {
    jobDescModal.style.display = 'none';
  }

  window.addEventListener('load', function () {
    const storeRefreshStatus = refreshSuspended;
    refreshSuspended = true;
    setMapHeight(mapdivid, map, 'load');
    refreshSuspended = storeRefreshStatus;
  });

  window.addEventListener('resize', function () {
    const storeRefreshStatus = refreshSuspended;
    refreshSuspended = true;
    setMapHeight(mapdivid, map, 'resize');
    refreshSuspended = storeRefreshStatus;
  });
});