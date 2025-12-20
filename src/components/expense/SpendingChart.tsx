import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/calculations';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  data: ChartDataItem[];
  totalSpent: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground rounded-lg shadow-lg p-3 border border-border">
        <p className="font-medium">{data.name}</p>
        <p className="text-accent font-semibold">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export const SpendingChart = ({ data, totalSpent }: SpendingChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p className="text-sm">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {formatCurrency(totalSpent)}
        </span>
      </div>
    </div>
  );
};

interface ChartLegendProps {
  data: ChartDataItem[];
}

export const ChartLegend = ({ data }: ChartLegendProps) => {
  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-muted-foreground truncate">
            {item.name}
          </span>
          <span className="text-sm font-medium text-foreground ml-auto">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};
