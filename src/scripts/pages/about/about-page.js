import Database from '../../data/database';

export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Laporan Tersimpan</h1>
        <div id="saved-reports-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const container = document.getElementById('saved-reports-list');
    try {
      const reports = await Database.getAllReports();

      if (reports.length === 0) {
        container.innerHTML = '<p>Tidak ada laporan tersimpan.</p>';
        return;
      }

      const listHTML = reports
        .map((report) => `
          <div class="saved-report-card">
            <p><strong>${report.name || 'Anonim'}</strong></p>
            <p>${report.description}</p>
            <img src="${report.photoUrl || ''}" alt="Foto" style="max-width: 200px;">
            <button data-id="${report.id}" class="delete-report-button">Hapus</button>
            <hr>
          </div>
        `).join('');

      container.innerHTML = listHTML;

      // Event untuk tombol hapus
      document.querySelectorAll('.delete-report-button').forEach((button) => {
        button.addEventListener('click', async (event) => {
          const id = event.currentTarget.getAttribute('data-id');
          await Database.deleteReport(id);
          await this.afterRender(); // refresh daftar
        });
      });
    } catch (error) {
      console.error('Gagal mengambil laporan:', error);
      container.innerHTML = '<p>Gagal mengambil laporan tersimpan.</p>';
    }
  }
}
