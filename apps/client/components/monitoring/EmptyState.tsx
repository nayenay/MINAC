interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[#333333] bg-[#171717] p-10 text-center">
      <h2 className="text-[22px] font-bold text-white mb-2">{title}</h2>
      <p className="text-[#aaaaaa]">{description}</p>
    </div>
  );
}
