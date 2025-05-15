import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
  generateSaveReportButtonTemplate
} from '../../templates';
import HomePresenter from './home-presenter';
import Map from '../../utils/map';
import * as StoryAPI from '../../data/api';
import Database from '../../data/database';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
      dbModel: Database,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateReportsList(message, reports) {
 
  if (!Array.isArray(reports)) {
    console.error('Reports is not an array:', reports);
    this.populateReportsListError('Format data tidak valid');
    return;
  }

  if (reports.length <= 0) {
    this.populateReportsListEmpty();
    return;
  }

  try {
    const html = reports.reduce((accumulator, report) => {
      
      if (!report || typeof report !== 'object') {
        return accumulator;
      }

      
      if (this.#map && report.lat && report.lon) {
        const coordinate = [report.lat, report.lon];
        const markerOptions = { alt: report.description || 'Laporan' };
        const popupOptions = { content: report.description || 'Laporan tanpa deskripsi' };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateReportItemTemplate({
          id: report.id || 'unknown',
          description: report.description || 'Tidak ada deskripsi',
          photo: report.photoUrl || report.photo || '',
          name: report.name || 'Anonim',
          createdAt: report.createdAt || new Date().toISOString(),
          lat: report.lat,
          lon: report.lon
        })
      );
    }, '');

    document.getElementById('reports-list').innerHTML = `
      <div class="reports-list">${html}</div>
    `;
    document.querySelectorAll('.save-report-button').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const reportId = event.currentTarget.getAttribute('data-id');
        const report = reports.find((r) => r.id === reportId);
        
        if (!report) return;
    
        const targetButton = event.currentTarget;
    
        try {
          await this.#presenter.saveReport(report);
          
          // Pastikan tombol masih ada di DOM sebelum memodifikasi
          if (targetButton && targetButton.isConnected) {
            targetButton.innerText = 'Tersimpan';
            targetButton.disabled = true;
          }
        } catch (e) {
          console.error('Error saving report:', e);
          if (targetButton && targetButton.isConnected) {
            alert('Gagal menyimpan laporan');
          }
        }
      });
    });

  } catch (error) {
    console.error('Error processing reports:', error);
    this.populateReportsListError('Gagal memproses data laporan');
  }
}

  

  populateReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  populateReportsListError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }
  
 renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateSaveReportButtonTemplate();

    document.getElementById('report-detail-save').addEventListener('click', async () => {
      alert('Laporan berhasil disimpan akan segera hadir');
    });
  }
  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }

  
}
