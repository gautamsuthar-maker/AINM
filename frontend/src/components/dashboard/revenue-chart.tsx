'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#a1a1aa', // brand-text-muted
        font: {
          family: "'DM Sans', sans-serif"
        }
      },
    },
    tooltip: {
      backgroundColor: '#1f1f1f', // base-300
      titleColor: '#ffffff',
      bodyColor: '#e8ecf4',
      borderColor: '#2a2a2a', // base-400
      borderWidth: 1,
    }
  },
  scales: {
    x: {
      ticks: { color: '#71717a' }, // text-tertiary
      grid: { color: '#2a2a2a' }, // base-400
    },
    y: {
      ticks: { 
        color: '#71717a',
        callback: function(value: any) {
          return '$' + value + 'K';
        }
      },
      grid: { color: '#2a2a2a' },
    },
  },
};

const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const data = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'Revenue',
      data: [180, 210, 245, 230, 260, 290],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16,185,129,.08)',
      tension: 0.3,
    },
    {
      fill: true,
      label: 'Ad Spend',
      data: [50, 55, 60, 58, 62, 68],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59,130,246,.08)',
      tension: 0.3,
    },
  ],
};

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Revenue vs Ad Spend (6mo)</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full">
        <Line options={options} data={data} />
      </CardContent>
    </Card>
  );
}
