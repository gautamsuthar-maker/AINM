'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
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
      ticks: { color: '#71717a' },
      grid: { display: false },
    },
    y: {
      ticks: { color: '#71717a' },
      grid: { color: '#2a2a2a' },
    },
  },
};

const labels = ['Google Ads', 'Meta Ads', 'TikTok', 'ASA', 'Snapchat', 'YouTube'];

const data = {
  labels,
  datasets: [
    {
      label: 'ROAS',
      data: [4.2, 3.6, 2.8, 5.1, 1.9, 3.2],
      backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'],
      borderRadius: 4,
    },
  ],
};

export function ChannelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Channel Performance</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full">
        <Bar options={options} data={data} />
      </CardContent>
    </Card>
  );
}
