import client from './client'

export const getSemuaBulan = () => client.get('/laporan/semua-bulan')
export const getLaporanBulanan = (bulan, tahun) =>
  client.get('/laporan/bulanan', { params: { bulan, tahun } })
