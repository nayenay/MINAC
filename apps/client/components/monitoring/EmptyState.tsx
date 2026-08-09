interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-3xl border border-dashed border-[#333333] bg-[#171717] px-6 py-10 text-center md:px-10"
    >
      <h2 className="mb-2 text-[20px] font-bold text-white md:text-[22px]">
        {title}
      </h2>
      <p className="mx-auto max-w-xl text-sm text-[#aaaaaa] md:text-base">
        {description}
      </p>
    </div>
  );
}
