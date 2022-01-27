import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

const data = {
    labels: [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  datasets: [
    {
      label: '',
      data: [
        2.23,
        2.215,
        2.22,
        2.25,
        2.245,
        2.27,
        2.28,
        2.29,
        2.3,
        2.29,
        2.325,
        2.325,
        2.32,
      ],
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 1)',
      pointBackgroundColor: 'rgba(255, 255, 255, 1)',
      fill: 'start',
      tension: 0.4,
    },
  ],
}

const options = {
  plugins: {
    legend: {
      display: false,
    }
  },
  elements: {
    point: {
      radius: 0
    }
  },
  layout: {
    padding: -20
  },
  scales: {
    yAxes: {
      ticks: {
        display: false
      },
      grid: {
        display: false,
        drawBorder: false
      }
    },
    xAxes: {
      ticks: {
        display: false
      },
      grid: {
        display: false,
        drawBorder: false
      },
    }
  },
};

const TreasuryChart = () => {
  return (
  <div className="rounded shadow-xl overflow-hidden w-full md:flex">
    <div className="w-full bg-indigo-500 text-white items-center">
      <div className="flex justify-between p-6">
        <p>Treasury</p>
        <p className="text-lg font-bold">2.32 ETH</p>
      </div>
      <Line type="line" data={data} options={options} />
    </div>
  </div>
  )
}

export default TreasuryChart