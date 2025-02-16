import { defineStore } from 'pinia';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    reload: false,
  }),
  actions: {
    startReload() {
      this.reload = true;
    },
    finishReload() {
      this.reload = false;
    }
  },
});
