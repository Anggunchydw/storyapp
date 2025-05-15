import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
   
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
   
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Cerita</a></li>
    <li><a id="report-list-button" class="report-list-button" href="#/new">Buat Cerita<i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateReportsListEmptyTemplate() {
  return `
    <div id="reports-list-empty" class="reports-list__empty">
      <h2>Tidak ada Cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateReportsListErrorTemplate(message) {
  return `
    <div id="reports-list-error" class="reports-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}


export function generateReportItemTemplate({
  id,
  description,
  photo,
  name,
  createdAt,
  lat,
  lon,
}) {
  const locationText = (lat && lon) ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Lokasi tidak tersedia';
  const reporterName = name || 'Anonim';

  return `
    <div tabindex="0" class="report-item" data-reportid="${id}">
      ${photo ? `
        <img class="report-item__image" src="${photo}" alt="${description.substring(0, 50)}">
      ` : `
        <div class="report-item__image-placeholder">
          <i class="fas fa-image"></i>
          <span>Tidak ada gambar</span>
        </div>
      `}
      <div class="report-item__body">
        <div class="report-item__description">
          <h5>${description}</h5>
        </div>
        <div class="report-item__more-info">
          <div class="report-item__author">
            <i class="fas fa-user"></i> ${reporterName}
          </div>
        </div>
        <div class="report-item__main">
          <div class="report-item__more-info">
            <div class="report-item__createdat">
              <i class="fas fa-calendar-alt"></i> mengunggah pada <strong>${showFormattedDate(createdAt, 'id-ID')}</strong> 
            </div>
          </div>
        </div>
        <div class="report-item__actions">
          <button class="save-report-button" data-id="${id}">
            Simpan laporan <i class="far fa-bookmark"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}


export function generateImagePlaceholderTemplate() {
  return `
    <div class="report-item__image-placeholder">
      <i class="fas fa-image"></i>
      <span>Tidak ada gambar</span>
    </div>
  `;
}


export function generateNotificationTemplate(type, message) {
  return `
    <div class="notification notification-${type}">
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}
export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveReportButtonTemplate() {
  return `
    <button id="report-detail-save" class="btn btn-transparent">
      Simpan laporan <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveReportButtonTemplate() {
  return `
    <button id="report-detail-remove" class="btn btn-transparent">
      Buang laporan <i class="fas fa-bookmark"></i>
    </button>
  `;
}