

interface Props {
    title: string;
    value: string;
  }
  
  const DashboardCard: React.FC<Props> = ({ title, value }) => (
    <div className="bg-white shadow rounded-xl p-5 flex flex-col justify-between min-h-[80px]">
      <h3 className="!text-indigo-700">{title}</h3>
      <p className="text-2xl font-semibold text-gray-600">{value}</p>
    </div>
  );
  
  export default DashboardCard;