import AddPresenter from './add-presenter';
import * as AddStoryAPI from '../../data/api';
import L from 'leaflet';

export default class AddPage {
  #presenter = null;
  #elements = {};
  #map = null;
  #marker = null;
  #stream = null; // Tambahkan variabel untuk menyimpan stream

  async render() {
    return `
      <section class="container">
        <h1>Tambah Cerita</h1>
        <form id="add-form">
          <label for="description">Deskripsi:</label>
          <textarea id="description" name="description" required></textarea>
          
          <div style="width: 100%; max-width: 500px; margin: 10px 0;">
            <video id="camera" autoplay playsinline style="width: 100%; height: auto; border: 1px solid #ccc;"></video>
            <canvas id="canvas" style="display: none;"></canvas>
            <button type="button" id="capture-btn" style="margin: 5px 0;">Ambil Foto</button>
          </div>
          
          <div id="map-form" style="width: 100%; height: 300px; margin: 10px 0; border: 1px solid #ccc;"></div>
          <p>Latitude: <span id="lat-value">-</span> | Longitude: <span id="lon-value">-</span></p>
          <button type="submit">Kirim</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#elements = {
      video: document.getElementById('camera'),
      canvas: document.getElementById('canvas'),
      captureBtn: document.getElementById('capture-btn'),
      form: document.getElementById('add-form'),
      mapContainer: document.getElementById('map-form'),
      latValue: document.getElementById('lat-value'),
      lonValue: document.getElementById('lon-value'),
      description: document.getElementById('description'),
    };

    // Inisialisasi presenter terlebih dahulu
    this.#presenter = new AddPresenter({ 
      view: this, 
      model: AddStoryAPI 
    });

    try {
      await this.initMap();
      await this.startCamera();
      
      this.#elements.captureBtn.addEventListener('click', () => this.handleCapturePhoto());
      this.#elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    } catch (error) {
      console.error('Initialization error:', error);
      this.showAlert(`Gagal memulai: ${error.message}`);
    }
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera');
      }
      
      this.#stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      this.#elements.video.srcObject = this.#stream;
      
      // Set stream ke presenter setelah semuanya siap
      if (this.#presenter && typeof this.#presenter.setStream === 'function') {
        this.#presenter.setStream(this.#stream);
      } else {
        console.warn('Presenter atau method setStream belum siap');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      this.showAlert('Gagal mengakses kamera: ' + err.message);
      this.#elements.video.style.display = 'none';
      this.#elements.captureBtn.style.display = 'none';
    }
  }

  handleCapturePhoto() {
    const { video, canvas } = this.#elements;
    
    // Pastikan video sudah siap
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return this.showAlert('Kamera belum siap. Tunggu sebentar.');
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    this.#presenter.setCapturedImage(imageData);
    this.showAlert('Foto berhasil diambil!');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const description = this.#elements.description.value.trim();
    
    if (!description) {
      return this.showAlert('Silakan isi deskripsi');
    }
    
    this.#presenter.submitReport(description);
  }
  showLoading(isLoading) {
  if (isLoading) {
    // Tampilkan loading indicator, bisa sesederhana seperti ini:
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.textContent = 'Mengirim...';
    loading.style.position = 'fixed';
    loading.style.top = '20px';
    loading.style.left = '50%';
    loading.style.transform = 'translateX(-50%)';
    loading.style.backgroundColor = 'rgba(0,0,0,0.7)';
    loading.style.color = 'white';
    loading.style.padding = '10px 20px';
    loading.style.borderRadius = '5px';
    loading.style.zIndex = '1000';
    document.body.appendChild(loading);
  } else {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
  }
}


  async initMap() {
    return new Promise((resolve) => {
      // Tunggu hingga container map benar-benar ada di DOM
      setTimeout(() => {
        this.#map = L.map(this.#elements.mapContainer, {
          center: [-8.2192, 114.3691],
          zoom: 13,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          this.#elements.latValue.textContent = lat.toFixed(5);
          this.#elements.lonValue.textContent = lng.toFixed(5);
          this.#presenter.setLocation(lat, lng);

          if (this.#marker) {
            this.#map.removeLayer(this.#marker);
          }
          
          this.#marker = L.marker([lat, lng]).addTo(this.#map);
        });

        resolve();
      }, 100);
    });
  }

  showAlert(message) {
    alert(message);
  }

  destroy() {
    if (this.#presenter) {
      this.#presenter.destroy();
    }
    
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
    
    this.#marker = null;
  }
}