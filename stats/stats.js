document.addEventListener('DOMContentLoaded', async () => {
  const statuses = await globalThis.AtcoderStorage.getProblemStatuses();
  const difficulties = await globalThis.AtcoderStorage.getDifficulties();

  let solved = 0;
  let attempted = 0;

  const contestTypes = { ABC: 0, ARC: 0, AGC: 0, Other: 0 };
  const diffCounts = { Easy: 0, Medium: 0, Hard: 0, VeryHard: 0 };

  for (const [probId, statusObj] of Object.entries(statuses)) {
    if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.SOLVED) {
      solved++;
      
      const prefix = probId.substring(0, 3).toUpperCase();
      if (['ABC', 'ARC', 'AGC'].includes(prefix)) {
        contestTypes[prefix]++;
      } else {
        contestTypes.Other++;
      }

      const diffVal = difficulties[probId];
      if (diffVal !== undefined) {
        if (diffVal >= 2000) diffCounts.VeryHard++;
        else if (diffVal >= 1200) diffCounts.Hard++;
        else if (diffVal >= 400) diffCounts.Medium++;
        else diffCounts.Easy++;
      }
    } else if (statusObj.status === globalThis.ATCODER_CONSTANTS.STATUS.ATTEMPTED) {
      attempted++;
    }
  }

  document.getElementById('total-solved').textContent = solved;
  document.getElementById('total-attempted').textContent = attempted;

  const ctxContest = document.getElementById('contestChart').getContext('2d');
  new Chart(ctxContest, {
    type: 'pie',
    data: {
      labels: Object.keys(contestTypes),
      datasets: [{
        data: Object.values(contestTypes),
        backgroundColor: ['#5bc0de', '#f0ad4e', '#d9534f', '#777777'],
        borderColor: '#1e1e1e',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#f0f0f0' } }
      }
    }
  });

  const ctxDiff = document.getElementById('difficultyChart').getContext('2d');
  new Chart(ctxDiff, {
    type: 'bar',
    data: {
      labels: ['Easy (<=400)', 'Medium (401-1199)', 'Hard (1200-1999)', 'Very Hard (>=2000)'],
      datasets: [{
        label: 'Solved Count',
        data: [diffCounts.Easy, diffCounts.Medium, diffCounts.Hard, diffCounts.VeryHard],
        backgroundColor: ['#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { color: '#f0f0f0', stepSize: 1 }, grid: { color: '#444' } },
        x: { ticks: { color: '#f0f0f0' }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    let csvContent = 'data:text/csv;charset=utf-8,problem_id,status\n';
    for (const [probId, statusObj] of Object.entries(statuses)) {
      csvContent += `${probId},${statusObj.status}\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'atcoder_solved_tracker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
