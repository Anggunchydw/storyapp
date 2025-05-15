export default class HomePresenter {
  #view;
  #model;
  #dbModel;

  constructor({ view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportsListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showReportsListMap();
  
      const response = await this.#model.getAllReports({ 
        location: true 
      });
  
      if (!response.ok) {
        console.error('initialGalleryAndMap: response:', response);
        this.#view.populateReportsListError(response.message);
        return;
      }
  
      
      let reports = [];
      if (response.data) {
    
        if (Array.isArray(response.data)) {
          reports = response.data;
        } else if (Array.isArray(response.data.listStory)) {
          reports = response.data.listStory; 
        } else if (Array.isArray(response.data.list)) {
          reports = response.data.list;
        } else if (Array.isArray(response.data.stories)) {
          reports = response.data.stories;
        }
      }
  
      console.log('Fetched reports:', reports); 
      this.#view.populateReportsList(response.message || 'Success', reports);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateReportsListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async postNewReport({description, photo, lat, lon }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.storeNewReport({
        description,
        photo,
        lat,
        lon
      });
  
      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }
  
      this.#view.storeSuccessfully(response.message);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed(error.message || 'Gagal mengirim cerita');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
  async saveReport(report) {
    try {
      await this.#dbModel.putReport(report);
    } catch (error) {
      console.warn('Warning saat menyimpan:', error);
      
      const existing = await this.#dbModel.getReport(report.id);
      if (!existing) {
        throw error; 
      }
    }
  }



}