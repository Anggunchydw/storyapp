function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export default class AddPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    this._stream = null;
    this.capturedImage = null;
    this.lat = null;
    this.lon = null;
  }

  setStream(stream) {
    this._stream = stream;
  }

  stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
  }

  getCurrentFacingMode() {
    return this.currentFacingMode;
  }

  setCapturedImage(imageData) {
    this.capturedImage = imageData;
  }

  setLocation(lat, lon) {
    this.lat = lat;
    this.lon = lon;
  }

  async submitReport(description) {
    if (!this.capturedImage) {
      this.view.showAlert('Silakan ambil foto terlebih dahulu.');
      return;
    }

    if (!this.lat || !this.lon) {
      this.view.showAlert('Silakan pilih lokasi.');
      return;
    }

    try {
      const photoBlob = dataURLtoBlob(this.capturedImage);
      
      // Show loading indicator
      this.view.showLoading(true);

      const response = await this.model.storeNewReport({
        description,
        photo: photoBlob,
        lat: this.lat,
        lon: this.lon,
      });

      if (response.ok) {
        this.view.showAlert('Berhasil menambahkan laporan.', 'success');
        
        // Kirim notifikasi ke semua user
        await this.#notifyToAllUser(response.data.id);

        // Redirect after a short delay
        setTimeout(() => {
          location.hash = '/';
        }, 1500);
      } else {
        this.view.showAlert('Gagal mengirim: ' + response.message);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      this.view.showAlert('Terjadi kesalahan saat mengirim laporan.');
    } finally {
      this.view.showLoading(false);
    }
  }

  destroy() {
    this.stopCamera();
  }

  async #notifyToAllUser(reportId) {
    try {
      const response = await this.model.sendReportToAllUserViaNotification(reportId);
      if (!response.ok) {
        console.error('Failed to send notifications:', response);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
}