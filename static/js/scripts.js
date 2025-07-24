// Set Chart.js global dark theme
Chart.defaults.font.color = '#e5e7eb'
Chart.defaults.color = '#e5e7eb'
Chart.defaults.borderColor = '#374151'
Chart.defaults.backgroundColor = '#1f2937'
Chart.defaults.plugins.legend.labels.color = '#d1d5db'
Chart.defaults.scales = {
  x: { grid: { color: '#374151' }, ticks: { color: '#e5e7eb' } },
  y: { grid: { color: '#374151' }, ticks: { color: '#e5e7eb' } }
}

const CSV_PATH = 'static/data/titanic.csv'
Papa.parse(CSV_PATH, {
  download: true,
  header: true,
  complete: ({ data }) => {
    const rows = data.filter(r => r.Survived !== undefined)
    // KPIs
    const male = rows.filter(r => r.Sex === 'male').length
    const female = rows.filter(r => r.Sex === 'female').length
    const survived = rows.filter(r => r.Survived === '1').length
    const rate = ((survived / 891) * 100).toFixed(1)
    const totalFare = rows.reduce((s, r) => s + parseFloat(r.Fare || 0), 0)

    document.getElementById('kpi-male').innerText = male
    document.getElementById('kpi-female').innerText = female
    document.getElementById('kpi-fare').innerText =
      '$' + (totalFare / 1000).toFixed(2) + 'K'
    document.getElementById('kpi-survived').innerText = survived
    document.getElementById('kpi-rate').innerText = rate + '%'

    // Data prep (igual ao original)
    const classes = ['1', '2', '3']
    const countByClass = classes.map(
      c => rows.filter(r => r.Pclass === c).length
    )
    const top10 = [...rows].sort((a, b) => b.Fare - a.Fare).slice(0, 10)
    const topNames = top10.map(r => r.Name.split(',')[0])
    const topFares = top10.map(r => r.Fare)
    const survivedByClass = classes.map(
      c => rows.filter(r => r.Pclass === c && r.Survived === '1').length
    )
    const diedByClass = classes.map(
      c => rows.filter(r => r.Pclass === c && r.Survived === '0').length
    )
    const ports = ['S', 'C', 'Q']
    const embarkedData = ports.map(port =>
      classes.map(
        c =>
          rows.filter(
            r => r.Embarked === port && r.Pclass === c && r.Survived === '1'
          ).length
      )
    )

    // Charts
    new Chart('chart-class-donut', {
      type: 'doughnut',
      data: {
        labels: ['1st', '2nd', '3rd'],
        datasets: [
          {
            data: countByClass,
            backgroundColor: ['#67817D', '#C5C9B5', '#85B0A2 ']
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
    new Chart('chart-top-fare', {
      type: 'bar',
      data: {
        labels: topNames,
        datasets: [{ data: topFares, backgroundColor: '#67817D' }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false // Show the legend
          }
        },
        scales: {
          x: {
            grid: { color: '#374151' },
            ticks: { color: '#e5e7eb' }
          },
          y: { grid: { color: '#374151' }, ticks: { color: '#e5e7eb' } }
        }
      }
    })
    new Chart('chart-survived-class', {
      type: 'bar',
      data: {
        labels: ['1st', '2nd', '3rd'],
        datasets: [
          { label: 'Died', data: diedByClass, backgroundColor: '#85B0A2' },
          {
            label: 'Survived',
            data: survivedByClass,
            backgroundColor: '#C5C9B5'
          }
        ]
      },
      options: { responsive: true, scales: Chart.defaults.scales }
    })
    new Chart('chart-embarked-class', {
      type: 'bar',
      data: {
        labels: ['Southampton', 'Cherbourg', 'Queenstown'],
        datasets: classes.map((c, i) => ({
          label: `${c}st Class`,
          data: ports.map((_, p) => embarkedData[p][i]),
          backgroundColor: ['#67817D', '#C5C9B5', '#85B0A2'][i]
        }))
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
            grid: Chart.defaults.scales.x.grid,
            ticks: Chart.defaults.scales.x.ticks
          },
          y: {
            stacked: true,
            grid: Chart.defaults.scales.y.grid,
            ticks: Chart.defaults.scales.y.ticks
          }
        }
      }
    })
  }
})
